"""
KisanAI — Model Training Script (Run on Google Colab with GPU)
Trains EfficientNetB0 on PlantVillage dataset (38 classes).

Inspired by: https://www.kaggle.com/code/sayedgamal99/plant-disease-classifier-pytorch-custom-cnn

Usage on Google Colab:
  1. Upload this file to Colab
  2. Set Runtime → Change Runtime Type → GPU (T4)
  3. Run all cells
  4. Download the trained model file
"""

import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader
from torchvision import datasets, transforms, models
import os
import time
import kagglehub

# ── Configuration ────────────────────────────────────────
BATCH_SIZE = 32
NUM_EPOCHS_FROZEN = 15
NUM_EPOCHS_FINETUNE = 10
LEARNING_RATE = 1e-3
FINETUNE_LR = 1e-5
MODEL_SAVE_PATH = "kisanai_model.pth"
NUM_CLASSES = 38
IMAGE_SIZE = 224

# ── Step 1: Download Dataset ─────────────────────────────
# Note: Currently using the 38-class PlantVillage dataset.
# TODO for future: Combine with other crop disease datasets like:
# - New Plant Diseases Dataset(Augmented)
# - Wheat Rust dataset
# - Rice Leaf Diseases dataset
print("⬇️ Downloading PlantVillage dataset using kagglehub...")
path = kagglehub.dataset_download("emmarex/plantdisease")
print("   Dataset downloaded to:", path)

# The dataset usually contains a 'PlantVillage' folder or 'plantvillage/PlantVillage'
# We need to find the directory that contains the 38 class folders.
DATASET_PATH = os.path.join(path, "PlantVillage")
if not os.path.exists(DATASET_PATH):
    DATASET_PATH = os.path.join(path, "plantvillage", "PlantVillage")

if not os.path.exists(DATASET_PATH):
    print(f"⚠️ Could not find the expected 'PlantVillage' folder inside {path}")
    # Fallback to just using the downloaded path (or a single subdirectory if there's only one)
    subdirs = [os.path.join(path, d) for d in os.listdir(path) if os.path.isdir(os.path.join(path, d))]
    if len(subdirs) == 1:
        DATASET_PATH = subdirs[0]
    else:
        DATASET_PATH = path

print(f"📂 Using dataset path: {DATASET_PATH}")

# ── Step 2: Data Transforms ──────────────────────────────
train_transform = transforms.Compose([
    transforms.RandomResizedCrop(IMAGE_SIZE),
    transforms.RandomHorizontalFlip(),
    transforms.RandomRotation(40),
    transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])

val_transform = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(IMAGE_SIZE),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])

# ── Step 3: Load Dataset ─────────────────────────────────
print("📂 Loading dataset...")
full_dataset = datasets.ImageFolder(DATASET_PATH, transform=train_transform)
print(f"   Total images: {len(full_dataset)}")
print(f"   Classes: {len(full_dataset.classes)}")
print(f"   Class names: {full_dataset.classes[:5]}...")

# Split: 80% train, 10% val, 10% test
total = len(full_dataset)
train_size = int(0.8 * total)
val_size = int(0.1 * total)
test_size = total - train_size - val_size

train_dataset, val_dataset, test_dataset = torch.utils.data.random_split(
    full_dataset, [train_size, val_size, test_size],
    generator=torch.Generator().manual_seed(42)
)

# Override transforms for val/test
val_dataset.dataset.transform = val_transform

train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True, num_workers=2, pin_memory=True)
val_loader = DataLoader(val_dataset, batch_size=BATCH_SIZE, shuffle=False, num_workers=2, pin_memory=True)
test_loader = DataLoader(test_dataset, batch_size=BATCH_SIZE, shuffle=False, num_workers=2, pin_memory=True)

print(f"   Train: {train_size} | Val: {val_size} | Test: {test_size}")

# ── Step 4: Build Model ──────────────────────────────────
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"🖥️  Using device: {device}")

model = models.efficientnet_b0(weights=models.EfficientNet_B0_Weights.IMAGENET1K_V1)

# Freeze all layers
for param in model.parameters():
    param.requires_grad = False

# Replace classifier head
model.classifier = nn.Sequential(
    nn.Dropout(p=0.3),
    nn.Linear(model.classifier[1].in_features, 256),
    nn.ReLU(),
    nn.Dropout(p=0.2),
    nn.Linear(256, NUM_CLASSES),
)

model = model.to(device)

criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.classifier.parameters(), lr=LEARNING_RATE)
scheduler = optim.lr_scheduler.ReduceLROnPlateau(optimizer, patience=3, factor=0.5)


# ── Step 5: Training Loop ────────────────────────────────
def train_one_epoch(model, loader, criterion, optimizer, device):
    model.train()
    total_loss, correct, total = 0, 0, 0
    for images, labels in loader:
        images, labels = images.to(device), labels.to(device)
        optimizer.zero_grad()
        outputs = model(images)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()
        total_loss += loss.item() * images.size(0)
        _, predicted = outputs.max(1)
        correct += predicted.eq(labels).sum().item()
        total += labels.size(0)
    return total_loss / total, correct / total


def validate(model, loader, criterion, device):
    model.eval()
    total_loss, correct, total = 0, 0, 0
    with torch.no_grad():
        for images, labels in loader:
            images, labels = images.to(device), labels.to(device)
            outputs = model(images)
            loss = criterion(outputs, labels)
            total_loss += loss.item() * images.size(0)
            _, predicted = outputs.max(1)
            correct += predicted.eq(labels).sum().item()
            total += labels.size(0)
    return total_loss / total, correct / total


# Phase 1: Train classifier head only
print("\n🏋️ Phase 1: Training classifier head (frozen base)...")
best_val_acc = 0
for epoch in range(NUM_EPOCHS_FROZEN):
    start = time.time()
    train_loss, train_acc = train_one_epoch(model, train_loader, criterion, optimizer, device)
    val_loss, val_acc = validate(model, val_loader, criterion, device)
    scheduler.step(val_loss)
    elapsed = time.time() - start

    print(f"  Epoch {epoch+1:2d}/{NUM_EPOCHS_FROZEN} | "
          f"Train Loss: {train_loss:.4f} Acc: {train_acc:.4f} | "
          f"Val Loss: {val_loss:.4f} Acc: {val_acc:.4f} | {elapsed:.1f}s")

    if val_acc > best_val_acc:
        best_val_acc = val_acc
        torch.save(model.state_dict(), MODEL_SAVE_PATH)
        print(f"  ✅ Best model saved (val_acc: {val_acc:.4f})")

# Phase 2: Fine-tune last 30 layers
print(f"\n🔧 Phase 2: Fine-tuning (unfreezing last 30 layers)...")
for param in model.parameters():
    param.requires_grad = False
for param in list(model.parameters())[-30:]:
    param.requires_grad = True
for param in model.classifier.parameters():
    param.requires_grad = True

optimizer = optim.Adam(filter(lambda p: p.requires_grad, model.parameters()), lr=FINETUNE_LR)

for epoch in range(NUM_EPOCHS_FINETUNE):
    start = time.time()
    train_loss, train_acc = train_one_epoch(model, train_loader, criterion, optimizer, device)
    val_loss, val_acc = validate(model, val_loader, criterion, device)
    elapsed = time.time() - start

    print(f"  Epoch {epoch+1:2d}/{NUM_EPOCHS_FINETUNE} | "
          f"Train Loss: {train_loss:.4f} Acc: {train_acc:.4f} | "
          f"Val Loss: {val_loss:.4f} Acc: {val_acc:.4f} | {elapsed:.1f}s")

    if val_acc > best_val_acc:
        best_val_acc = val_acc
        torch.save(model.state_dict(), MODEL_SAVE_PATH)
        print(f"  ✅ Best model saved (val_acc: {val_acc:.4f})")

# ── Step 6: Test ──────────────────────────────────────────
model.load_state_dict(torch.load(MODEL_SAVE_PATH, weights_only=True))
test_loss, test_acc = validate(model, test_loader, criterion, device)
print(f"\n🎯 Final Test Accuracy: {test_acc:.4f} ({test_acc*100:.1f}%)")
print(f"📦 Model saved to: {MODEL_SAVE_PATH}")
print(f"   Copy this file to: backend/ml/models/kisanai_model.pth")
