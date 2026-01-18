from fastapi import FastAPI
from pydantic import BaseModel
from PIL import Image
import requests
from io import BytesIO
import torch
from torchvision import transforms
import torch.nn as nn
import timm

app = FastAPI()

# -------------------------------
# Request Schema
# -------------------------------
class ImageRequest(BaseModel):
    image_url: str

# -------------------------------
# Model Definition
# -------------------------------
class AccidentClassifier(nn.Module):
    def __init__(self, model_name='efficientnet_b0', num_classes=2, pretrained=False):
        super().__init__()
        self.backbone = timm.create_model(model_name, pretrained=pretrained, num_classes=0)
        num_features = self.backbone.num_features
        self.classifier = nn.Sequential(
            nn.Dropout(0.3),
            nn.Linear(num_features, 512),
            nn.ReLU(),
            nn.BatchNorm1d(512),
            nn.Dropout(0.2),
            nn.Linear(512, num_classes)
        )

    def forward(self, x):
        features = self.backbone(x)
        return self.classifier(features)

# -------------------------------
# Load Model
# -------------------------------
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
checkpoint = torch.load("cnn_accident_model.pth", map_location=device)

if isinstance(checkpoint, dict) and 'model_state_dict' in checkpoint:
    state_dict = checkpoint['model_state_dict']
    model_type = checkpoint.get('model_type', 'efficientnet_b0')
else:
    state_dict = checkpoint
    model_type = 'efficientnet_b0'

model = AccidentClassifier(model_name=model_type, num_classes=2, pretrained=False)
model.load_state_dict(state_dict)
model.to(device)
model.eval()

# -------------------------------
# Preprocessing
# -------------------------------
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485,0.456,0.406],[0.229,0.224,0.225])
])

# -------------------------------
# Prediction Endpoint
# -------------------------------
@app.post("/predict")
def predict(data: ImageRequest):
    try:
        response = requests.get(data.image_url)
        img = Image.open(BytesIO(response.content)).convert("RGB")
    except Exception as e:
        return {"error": f"Failed to open image: {str(e)}"}

    img_tensor = transform(img).unsqueeze(0).to(device)

    with torch.no_grad():
        outputs = model(img_tensor)
        probs = torch.softmax(outputs, dim=1)
        confidence, pred = torch.max(probs, 1)

    result = "accident" if pred.item() == 0 else "not accident"
    return {
        "prediction": result,
        "confidence": float(confidence),
        "probabilities": probs.squeeze().tolist()
    }

# -------------------------------
# Test root
# -------------------------------
@app.get("/")
def root():
    return {"message": "Accident Detection ML Server Running"}