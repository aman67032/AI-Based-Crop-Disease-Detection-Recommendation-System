🌾 AI-Based Crop Disease Detection & Recommendation System
Complete Technical & Design Document

1. PROJECT OVERVIEW
Name: KisanAI — Crop Disease Detection & Smart Advisory
Stack: Next.js 14 (App Router) + React PWA + Python FastAPI + TensorFlow + Claude API
Target Users: Farmers, Agronomists, Agricultural Extension Workers
Languages Supported: English, Hindi, Rajasthani, Tamil, Telugu, Marathi

2. ANSWER — SUPERVISED OR UNSUPERVISED?
100% Supervised Learning. Here's why:
Crop disease detection is an image classification problem. You already know the labels — "Wheat Rust", "Tomato Blight", "Healthy" etc. Supervised learning is the only right approach here.
Unsupervised (clustering) won't work because:

You need exact disease names, not just "Group A" and "Group B"
Farmers need actionable named diseases, not abstract clusters
No treatment can be recommended without knowing the exact disease


3. WHICH MODEL TO USE?
❌ NOT XGBoost or Random Forest
XGBoost and Random Forest work on tabular/structured data (rows and columns). Crop images are unstructured pixel data. They cannot process raw images effectively.
✅ Use CNN — Specifically EfficientNetB0
ModelWhyEfficientNetB0 ✅Best accuracy-to-size ratio, runs on mobile, fast inferenceMobileNetV2Lighter, good for offline/edge devicesResNet50Heavier, better accuracy but slow on mobileVGG16Too heavy, outdatedYOLOv8If you want real-time bounding box detection on leaves
Winner for your hackathon: EfficientNetB0 with Transfer Learning
Why Transfer Learning?

Don't train from scratch (takes days + huge GPU)
EfficientNetB0 is pre-trained on ImageNet (14 million images)
You just fine-tune the last few layers on PlantVillage dataset
Takes 2-3 hours to train on Google Colab (free!)


4. DATA SOURCE
Primary Dataset — PlantVillage

Link: https://www.kaggle.com/datasets/emmarex/plantdisease , https://www.kaggle.com/code/sayedgamal99/plant-disease-classifier-pytorch-custom-cnn 
Size: 54,305 images
Crops: 14 crop types
Diseases: 38 disease classes
Format: JPG images, already labeled in folder names
License: Free for research/hackathon use

Folder Structure of PlantVillage:
PlantVillage/
├── Tomato_Bacterial_Spot/        (2127 images)
├── Tomato_Early_Blight/          (1000 images)
├── Tomato_Healthy/               (1591 images)
├── Wheat_Leaf_Rust/              (1000 images)
├── Corn_Common_Rust/             (1192 images)
├── Potato_Early_Blight/          (1000 images)
├── Rice_Leaf_Blast/              (800 images)
└── ... 38 folders total
Secondary Data (for recommendations):

ICAR (Indian Council of Agricultural Research) treatment database — https://icar.org.in
NIPHM (National Institute of Plant Health Management) — https://niphm.gov.in/manually curate 38 disease treatments as JSON
This JSON becomes your recommendation knowledge base fed to grok API


5. HOW TO TRAIN THE MODEL
Step 1 — Setup (Google Colab, Free GPU)
python# Install dependencies
pip install tensorflow==2.13 numpy pandas matplotlib scikit-learn

# Mount Google Drive to save model
from google.colab import drive
drive.mount('/content/drive')
Step 2 — Load & Preprocess Data
pythonimport tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator

# Data augmentation to prevent overfitting
train_datagen = ImageDataGenerator(
    rescale=1./255,
    rotation_range=40,
    width_shift_range=0.2,
    height_shift_range=0.2,
    horizontal_flip=True,
    zoom_range=0.2,
    validation_split=0.2   # 80% train, 20% validation
)

train_generator = train_datagen.flow_from_directory(
    'PlantVillage/',
    target_size=(224, 224),   # EfficientNetB0 input size
    batch_size=32,
    class_mode='categorical',
    subset='training'
)

val_generator = train_datagen.flow_from_directory(
    'PlantVillage/',
    target_size=(224, 224),
    batch_size=32,
    class_mode='categorical',
    subset='validation'
)
Step 3 — Build Model with Transfer Learning
pythonfrom tensorflow.keras.applications import EfficientNetB0
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout
from tensorflow.keras.models import Model

# Load pretrained EfficientNetB0 (no top layer)
base_model = EfficientNetB0(
    weights='imagenet',
    include_top=False,
    input_shape=(224, 224, 3)
)

# Freeze base layers (use pretrained features)
base_model.trainable = False

# Add custom classification head
x = base_model.output
x = GlobalAveragePooling2D()(x)
x = Dropout(0.3)(x)
x = Dense(256, activation='relu')(x)
x = Dropout(0.2)(x)
output = Dense(38, activation='softmax')(x)  # 38 disease classes

model = Model(inputs=base_model.input, outputs=output)

model.compile(
    optimizer='adam',
    loss='categorical_crossentropy',
    metrics=['accuracy']
)
Step 4 — Train
pythonfrom tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint

callbacks = [
    EarlyStopping(patience=5, restore_best_weights=True),
    ModelCheckpoint('best_model.h5', save_best_only=True)
]

history = model.fit(
    train_generator,
    epochs=20,
    validation_data=val_generator,
    callbacks=callbacks
)
# Expected accuracy: 92-96%
Step 5 — Fine-tune (Optional, boosts accuracy)
python# Unfreeze last 30 layers of base model
base_model.trainable = True
for layer in base_model.layers[:-30]:
    layer.trainable = False

model.compile(optimizer=tf.keras.optimizers.Adam(1e-5), ...)
model.fit(train_generator, epochs=10, ...)
# Accuracy goes to 96-98%
Step 6 — Export Model
python# Save for FastAPI backend
model.save('kisanai_model.h5')

# Convert to TensorFlow.js for offline browser use
# pip install tensorflowjs
# tensorflowjs_converter --input_format keras kisanai_model.h5 ./tfjs_model

6. COMPLETE SYSTEM ARCHITECTURE
┌─────────────────────────────────────────────┐
│              FARMER'S DEVICE                │
│                                             │
│  📱 Next.js PWA (installable on mobile)     │
│                                             │
│  ┌─────────────┐    ┌──────────────────┐   │
│  │ Camera/File  │ → │  Image Preview   │   │
│  │  Capture     │    │  + Crop Selector │   │
│  └─────────────┘    └──────────────────┘   │
│           ↓                                 │
│  ┌──────────────────────────────────────┐  │
│  │   OFFLINE MODE?                      │  │
│  │   YES → TensorFlow.js (in browser)   │  │
│  │   NO  → Send to FastAPI backend      │  │
│  └──────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
              ↓ (if online)
┌─────────────────────────────────────────────┐
│           FASTAPI BACKEND                   │
│                                             │
│  1. Receive image                           │
│  2. Preprocess (resize to 224x224)          │
│  3. Run EfficientNetB0 model                │
│  4. Get disease label + confidence %        │
│  5. Lookup treatment JSON database          │
│  6. Send disease + context to Claude API    │
│  7. Claude generates recommendation         │
│  8. Google Translate API → Hindi/Regional   │
│  9. Return full response to frontend        │
└─────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────┐
│           RESPONSE TO FARMER                │
│                                             │
│  Disease Name + Confidence Score            │
│  Severity Level (Low/Medium/High)           │
│  Treatment Recommendation (text)            │
│  Voice Output (Hindi TTS)                   │
│  Nearby Agri Store Suggestions (optional)   │
└─────────────────────────────────────────────┘

7. FULL FUNCTIONALITY LIST
Core Features

📸 Real-time camera scan — point and detect
🖼️ Image upload — gallery photo upload
🌾 Multi-crop support — Wheat, Rice, Tomato, Potato, Corn, Cotton
🧠 Disease detection — 38 disease classes with confidence %
💊 Treatment recommendations — pesticide, organic, cultural practices
🌐 Multilingual — Hindi, English, Rajasthani, Tamil
🗣️ Voice output — speaks recommendation in farmer's language
📴 Offline mode — works without internet (TensorFlow.js)
📊 History log — tracks past detections
🗺️ Disease heatmap — shows disease spread in region (bonus)

Bonus Features (Differentiators)

📅 Seasonal alerts — "Wheat Rust season coming, take precautions"
🌦️ Weather integration — links weather to disease risk
👨‍🌾 Expert connect — chat with agronomist (optional)
📍 Location-based — regional crop suggestions


8. COMPLETE USER FLOW
STEP 1: LANDING
Farmer opens app on mobile
↓
Sees: "KisanAI - अपनी फसल स्कैन करें"
Language selector (Hindi / English / Regional)

STEP 2: CROP SELECTION
Select crop type:
[ Wheat ] [ Rice ] [ Tomato ] [ Potato ] [ Corn ] [ Cotton ]
(Helps model focus on relevant disease classes)

STEP 3: IMAGE CAPTURE
Option A: 📸 Open Camera → real-time viewfinder
Option B: 🖼️ Upload from gallery
Guidelines shown: "Hold 20cm from leaf, ensure good lighting"

STEP 4: PROCESSING (2-3 seconds)
Loading animation: "Analyzing your crop..."
- Image resized to 224x224
- Passed through EfficientNetB0
- Top 3 predictions returned

STEP 5: RESULTS SCREEN
┌─────────────────────────────────┐
│  🔴 Wheat Leaf Rust             │
│  Confidence: 94%                │
│  Severity: HIGH                 │
│                                 │
│  Also detected:                 │
│  • Septoria (4%)                │
│  • Healthy (2%)                 │
└─────────────────────────────────┘

STEP 6: RECOMMENDATION
┌─────────────────────────────────┐
│  💊 Treatment Plan              │
│                                 │
│  Chemical: Propiconazole 25%    │
│  Dose: 1ml per litre water      │
│  Spray: Early morning           │
│                                 │
│  Organic: Neem oil spray        │
│  Prevention: Crop rotation      │
│                                 │
│  ⚠️ Do not irrigate for 3 days  │
└─────────────────────────────────┘
🔊 [Listen in Hindi]

STEP 7: SAVE & SHARE
Save to history
Share with other farmers via WhatsApp

9. NEXT.JS + REACT PWA SETUP
Why this combination is perfect:

Next.js = SEO, server-side rendering, API routes, fast
PWA = Installable on Android (farmers' phones), works offline
Together = Best of both worlds

Project Structure
kisanai/
├── app/                        # Next.js App Router
│   ├── page.tsx                # Landing page
│   ├── scan/page.tsx           # Camera scan page
│   ├── results/page.tsx        # Disease results
│   ├── history/page.tsx        # Past detections
│   └── api/
│       └── detect/route.ts     # API route → calls FastAPI
├── components/
│   ├── CameraCapture.tsx       # Camera component
│   ├── DiseaseCard.tsx         # Result display
│   ├── RecommendationCard.tsx  # Treatment display
│   ├── LanguageSelector.tsx    # Hindi/English toggle
│   └── VoiceOutput.tsx         # Text-to-speech
├── public/
│   ├── manifest.json           # PWA manifest
│   ├── sw.js                   # Service worker (offline)
│   └── icons/                  # PWA icons
├── lib/
│   ├── tfjs-model/             # TensorFlow.js model files
│   └── translations.ts         # Language strings
├── next.config.js              # PWA config
└── backend/                    # FastAPI (separate folder)
    ├── main.py
    ├── model.py
    └── requirements.txt
PWA Config (next.config.js)
javascriptconst withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development'
})

module.exports = withPWA({
  reactStrictMode: true,
})
PWA Manifest (public/manifest.json)
json{
  "name": "KisanAI - Crop Doctor",
  "short_name": "KisanAI",
  "description": "AI-powered crop disease detection for farmers",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#16a34a",
  "theme_color": "#16a34a",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}

10. REAL-TIME IMAGE ANALYSIS
Online Mode (FastAPI Backend)
python# backend/main.py
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import tensorflow as tf
import numpy as np
from PIL import Image
import io

app = FastAPI()
model = tf.keras.models.load_model('kisanai_model.h5')

CLASS_NAMES = [
    'Corn_Common_Rust', 'Potato_Early_Blight', 'Tomato_Bacterial_Spot',
    'Wheat_Leaf_Rust', 'Rice_Leaf_Blast', 'Tomato_Healthy', ...
]  # all 38 classes

@app.post("/detect")
async def detect_disease(file: UploadFile = File(...), language: str = "hi"):
    # Read and preprocess image
    contents = await file.read()
    img = Image.open(io.BytesIO(contents)).resize((224, 224))
    img_array = np.array(img) / 255.0
    img_array = np.expand_dims(img_array, axis=0)

    # Run model
    predictions = model.predict(img_array)[0]
    top3_indices = predictions.argsort()[-3:][::-1]

    results = [
        {
            "disease": CLASS_NAMES[i],
            "confidence": float(predictions[i] * 100)
        }
        for i in top3_indices
    ]

    # Get recommendation from Claude
    recommendation = await get_recommendation(results[0]['disease'], language)

    return {
        "detections": results,
        "recommendation": recommendation,
        "severity": calculate_severity(results[0]['confidence'])
    }
Offline Mode (TensorFlow.js in browser)
typescript// components/OfflineDetector.tsx
import * as tf from '@tensorflow/tfjs'

let model: tf.LayersModel | null = null

export async function loadModel() {
  model = await tf.loadLayersModel('/tfjs_model/model.json')
  // Model is cached by service worker — works offline!
}

export async function detectDisease(imageElement: HTMLImageElement) {
  if (!model) await loadModel()

  const tensor = tf.browser.fromPixels(imageElement)
    .resizeNearestNeighbor([224, 224])
    .toFloat()
    .div(255.0)
    .expandDims(0)

  const predictions = model.predict(tensor) as tf.Tensor
  const data = await predictions.data()

  // Return top prediction
  const maxIndex = data.indexOf(Math.max(...Array.from(data)))
  return {
    disease: CLASS_NAMES[maxIndex],
    confidence: data[maxIndex] * 100
  }
}

11. CLAUDE API — RECOMMENDATION GENERATION
python# backend/recommendation.py
import anthropic

client = anthropic.Anthropic(api_key="your_api_key")

TREATMENT_DB = {
    "Wheat_Leaf_Rust": {
        "chemical": "Propiconazole 25% EC @ 1ml/L",
        "organic": "Neem oil 3% spray",
        "prevention": "Use resistant varieties, crop rotation",
        "urgency": "HIGH"
    },
    # ... all 38 diseases
}

async def get_recommendation(disease: str, language: str = "hi"):
    treatment = TREATMENT_DB.get(disease, {})

    prompt = f"""
    You are an expert Indian agricultural scientist.
    A farmer's crop has been diagnosed with: {disease}

    Known treatment data:
    Chemical: {treatment.get('chemical')}
    Organic option: {treatment.get('organic')}
    Prevention: {treatment.get('prevention')}

    Generate a clear, simple recommendation for a rural Indian farmer.
    Include:
    1. What this disease is (1 simple sentence)
    2. Immediate action to take
    3. Dosage and application method
    4. What NOT to do
    5. When to expect recovery

    Respond in {language} language. Use simple words a farmer can understand.
    Keep it under 150 words.
    """

    message = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=500,
        messages=[{"role": "user", "content": prompt}]
    )

    return message.content[0].text

12. UI/UX DESIGN SPECIFICATION
Color Palette
Primary Green:    #16a34a  (farmer-friendly, nature)
Light Green:      #86efac
Dark Green:       #14532d
Warning Orange:   #f97316  (medium severity)
Danger Red:       #dc2626  (high severity)
Healthy Green:    #22c55e  (healthy crop)
Background:       #f0fdf4
Text Primary:     #1a1a1a
Text Secondary:   #6b7280
Typography
Heading Font:  Noto Sans Devanagari (supports Hindi)
Body Font:     Inter
Size Scale:    12px / 14px / 16px / 20px / 24px / 32px
Screen Designs
Screen 1 — Home / Landing
┌─────────────────────────────┐
│  🌿 KisanAI    [EN | हिं]   │
│                             │
│   [Beautiful crop field     │
│    illustration/photo]      │
│                             │
│  "अपनी फसल की जांच करें"    │
│  "Check Your Crop Health"   │
│                             │
│  ┌─────────────────────┐   │
│  │  📸 Scan Crop Now   │   │  ← Big green CTA button
│  └─────────────────────┘   │
│                             │
│  [Recent Detections]        │
│  • Wheat Rust — 2 days ago  │
│  • Healthy — 5 days ago     │
└─────────────────────────────┘
Screen 2 — Crop Selection
┌─────────────────────────────┐
│  ← Select Your Crop         │
│                             │
│  🌾 Wheat    🌾 Rice        │
│  🍅 Tomato   🥔 Potato      │
│  🌽 Corn     🌿 Cotton      │
│                             │
│  Selected: [Wheat ✓]        │
│                             │
│  [Continue →]               │
└─────────────────────────────┘
Screen 3 — Camera Scan
┌─────────────────────────────┐
│  ← Scan Leaf                │
│                             │
│  ┌─────────────────────┐   │
│  │                     │   │
│  │   📷 LIVE CAMERA    │   │
│  │                     │   │
│  │  [Corner guides for │   │
│  │   leaf alignment]   │   │
│  │                     │   │
│  └─────────────────────┘   │
│                             │
│  💡 "Hold 20cm from leaf"   │
│                             │
│     [📸 Capture]            │
│  [🖼️ Upload from Gallery]   │
└─────────────────────────────┘
Screen 4 — Results
┌─────────────────────────────┐
│  ← Results                  │
│                             │
│  [Leaf image thumbnail]     │
│                             │
│  🔴 Wheat Leaf Rust         │
│  ████████████░░  94%        │
│  Severity: HIGH             │
│                             │
│  Other possibilities:       │
│  • Septoria       4%        │
│  • Healthy        2%        │
│                             │
│  ──────────────────────     │
│  💊 TREATMENT PLAN          │
│                             │
│  Chemical: Propiconazole    │
│  Dose: 1ml per litre        │
│  Time: Early morning        │
│                             │
│  🌿 Organic: Neem oil       │
│                             │
│  ⚠️ No irrigation 3 days    │
│                             │
│  [🔊 सुनें - Listen]        │
│  [💾 Save] [📤 Share]       │
└─────────────────────────────┘

13. COMPLETE TECH STACK SUMMARY
ComponentTechnologyWhyFrontend FrameworkNext.js 14 (App Router)SSR, routing, API routesPWAnext-pwa + service workerOffline + installableUI LibraryTailwind CSS + shadcn/uiFast beautiful UICamerareact-webcamEasy camera accessML (Online)Python TensorFlow + EfficientNetB0Best accuracyML (Offline)TensorFlow.jsRuns in browser, no internetBackendFastAPI (Python)Fast, async, ML-friendlyGenAIClaude API (claude-sonnet)RecommendationsTranslationGoogle Translate APIHindi/RegionalVoiceWeb Speech APIFree, works offlineDatasetPlantVillage (Kaggle)54k images, 38 classesDeploymentVercel (frontend) + Railway (backend)Free tier available

14. STEP-BY-STEP BUILD ORDER
DAY 1 - MORNING (0-4 hrs)
✅ Download PlantVillage dataset from Kaggle
✅ Set up Google Colab notebook
✅ Start model training (runs in background)
✅ Initialize Next.js project with Tailwind

DAY 1 - AFTERNOON (4-10 hrs)
✅ Model finishes training → export .h5 + TF.js
✅ Build FastAPI backend with /detect endpoint
✅ Build camera capture component in Next.js
✅ Connect frontend to backend API

DAY 1 - EVENING (10-16 hrs)
✅ Build results screen UI
✅ Integrate Claude API for recommendations
✅ Add Hindi language support
✅ Add voice output (Web Speech API)

DAY 1 - NIGHT (16-22 hrs)
✅ Add offline mode (TensorFlow.js)
✅ Configure PWA manifest + service worker
✅ Add crop selection screen
✅ Test on real mobile device

DAY 2 - MORNING (22-24 hrs)
✅ Polish UI
✅ Prepare demo dataset (5-6 test images)
✅ Write pitch script
✅ Deploy to Vercel + Railway

15. EXPECTED MODEL PERFORMANCE
MetricExpected ValueTraining Accuracy96-98%Validation Accuracy92-95%Inference Time (online)200-400msInference Time (offline TF.js)1-2 secondsModel Size (.h5)~20MBTF.js Model Size~15MB (cached offline)

16. PITCH TO JUDGES (30 seconds)

"India has 140 million farmers. Every year, 30% of crops are lost to diseases — not because there's no cure, but because farmers can't identify the disease in time. KisanAI lets any farmer point their phone at a leaf and get an instant diagnosis with treatment advice in their own language — even without internet. We use EfficientNetB0 trained on 54,000 crop images with 94% accuracy, and Claude AI to generate advice a farmer can actually understand and act on. This isn't just a hackathon project — it's something that can be deployed tomorrow."

