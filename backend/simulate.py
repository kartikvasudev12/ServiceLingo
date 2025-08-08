import requests
import time
from datetime import datetime, timezone

BASE_URL = "http://localhost:3000"
VIDEO_LINK = "https://s3.amazonaws.com/your-bucket/input.mp4"
OUTPUT_LINK = "https://s3.amazonaws.com/your-bucket/output.mp4"

STAGES = [
    "video_to_audio",
    "audio_to_text",
    "text_translate",
    "text_to_audio"
    # merge_audio_video will be handled separately
]

def timestamp_now():
    return datetime.now(timezone.utc).isoformat()

def send_trigger():
    print("🚀 Triggering new job...")
    res = requests.post(f"{BASE_URL}/trigger", json={"video_link": VIDEO_LINK})
    print("Trigger:", res.status_code)

def send_update(stage, status, extra=None):
    payload = {
        "stage_name": stage,
        "status": status,
        "timestamp": timestamp_now()
    }
    if extra:
        payload.update(extra)
    res = requests.post(f"{BASE_URL}/stage-update", json=payload)
    print(f"[{status.upper()}] {stage} → {res.status_code}")

# Start simulation
send_trigger()
time.sleep(1)

# Process regular stages
for stage in STAGES:
    send_update(stage, "started")
    time.sleep(2)
    send_update(stage, "completed")
    time.sleep(1)

# Final stage with output link
final_stage = "merge_audio_video"
send_update(final_stage, "started")
time.sleep(2)
send_update(final_stage, "completed", { "output_link": OUTPUT_LINK })

print("✅ Simulation complete.")

