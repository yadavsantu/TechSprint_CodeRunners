import torch
import timm
from PIL import Image
from torchvision import transforms
import os

# ===============================
# STEP 1: DEVICE
# ===============================
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print("Using device:", device)


# ===============================
# STEP 2: LOAD CORRECT MODEL
# ===============================
MODEL_PATH = "accident_model.pth"   # your checkpoint

model = timm.create_model(
    "mobilenetv3_small_100",   # 🔴 THIS IS THE FIX
    pretrained=False,
    num_classes=2
)

checkpoint = torch.load(MODEL_PATH, map_location=device)

# remove backbone. prefix if exists
cleaned = {}
for k, v in checkpoint.items():
    if k.startswith("backbone."):
        k = k.replace("backbone.", "")
    cleaned[k] = v

model.load_state_dict(cleaned, strict=True)
model.to(device)
model.eval()

print("✅ Model loaded successfully")


# ===============================
# STEP 3: IMAGE TRANSFORM
# ===============================
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])


# ===============================
# STEP 4: PREDICTION FUNCTION
# ===============================
def predict(image_path):
    if not os.path.exists(image_path):
        return {"error": "Image not found"}

    image = Image.open(image_path).convert("RGB")
    image = transform(image).unsqueeze(0).to(device)

    with torch.no_grad():
        output = model(image)
        probs = torch.softmax(output, dim=1)
        conf, pred = torch.max(probs, 1)

    labels = ["Non-Accident", "Accident"]

    return {
        "prediction": labels[pred.item()],
        "confidence": round(conf.item() * 100, 2)
    }


# ===============================
# STEP 5: TEST
# ===============================
if __name__ == "__main__":
    result = predict("test.jpg")  # replace with your image
    print(result)
