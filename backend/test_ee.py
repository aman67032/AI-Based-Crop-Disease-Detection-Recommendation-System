"""Full NDVI test — calls the same function the API uses."""
import json, os, sys
sys.path.insert(0, os.path.dirname(__file__))

from services.earth_engine_service import get_ndvi_thumbnail

# Test polygon — a small farm area near Lucknow, India
test_coords = [
    [26.85, 80.95],
    [26.85, 80.96],
    [26.86, 80.96],
    [26.86, 80.95],
]

print("Testing NDVI thumbnail generation...")
try:
    url = get_ndvi_thumbnail(test_coords)
    print(f"SUCCESS! NDVI thumbnail URL:\n{url}")
except Exception as e:
    print(f"FAILED: {e}")
