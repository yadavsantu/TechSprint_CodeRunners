
    ACCIDENT DETECTION MODEL
    ========================
    
    Model Details:
    - Architecture: EfficientNet-B0
    - Test Accuracy: 93.24%
    - Classes: Accident, Non-Accident
    - Input Size: 224x224
    
    Usage:
    import torch
    from torchvision import models, transforms
    from PIL import Image
    
    # Load model
    model = models.efficientnet_b0(pretrained=False)
    model.classifier[1] = torch.nn.Linear(model.classifier[1].in_features, 2)
    model.load_state_dict(torch.load('accident_model.pth'))
    model.eval()
    