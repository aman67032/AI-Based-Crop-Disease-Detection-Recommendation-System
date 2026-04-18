"""PyTorch CNN inference engine for PlantVillage disease classification."""

import torch
import torch.nn as nn
from torchvision import transforms, models
from PIL import Image
import io
import numpy as np
from ml.class_names import CLASS_NAMES, NUM_CLASSES, get_display_name, is_healthy, get_crop

# Singleton model instance
_model = None
_device = None


def _build_model() -> nn.Module:
    """Build EfficientNetB0 with custom 38-class head."""
    model = models.efficientnet_b0(weights=None)
    model.classifier = nn.Sequential(
        nn.Dropout(p=0.3),
        nn.Linear(model.classifier[1].in_features, 256),
        nn.ReLU(),
        nn.Dropout(p=0.2),
        nn.Linear(256, NUM_CLASSES),
    )
    return model


def load_model(model_path: str = "ml/models/kisanai_model.pth") -> None:
    """Load trained model weights (call once at startup)."""
    global _model, _device
    _device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    _model = _build_model()
    try:
        state_dict = torch.load(model_path, map_location=_device, weights_only=True)
        _model.load_state_dict(state_dict)
        print(f"[OK] Model loaded from {model_path} on {_device}")
    except FileNotFoundError:
        print(f"[WARN] Model file not found at {model_path} -- using random weights (demo mode)")
    _model.to(_device)
    _model.eval()


# Image preprocessing — same as training pipeline
_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])


def predict(image_bytes: bytes, top_k: int = 3) -> dict:
    """
    Run inference on an image.
    Returns dict with top_k predictions, severity, and metadata.
    """
    global _model, _device

    if _model is None:
        load_model()

    # Load and preprocess
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    tensor = _transform(img).unsqueeze(0).to(_device)

    # Inference
    with torch.no_grad():
        outputs = _model(tensor)
        probabilities = torch.nn.functional.softmax(outputs, dim=1)[0]

    # Top-K predictions
    top_probs, top_indices = torch.topk(probabilities, top_k)
    predictions = []
    for prob, idx in zip(top_probs.cpu().numpy(), top_indices.cpu().numpy()):
        class_key = CLASS_NAMES[idx]
        predictions.append({
            "class_key": class_key,
            "disease": get_display_name(class_key),
            "crop": get_crop(class_key),
            "confidence": round(float(prob) * 100, 2),
            "is_healthy": is_healthy(class_key),
        })

    # Primary prediction
    primary = predictions[0]
    confidence = primary["confidence"]
    severity = "HIGH" if confidence > 80 else "MEDIUM" if confidence > 50 else "LOW"

    return {
        "primary": primary,
        "predictions": predictions,
        "severity": severity if not primary["is_healthy"] else "NONE",
        "model_version": "efficientnet_b0_v1",
    }
