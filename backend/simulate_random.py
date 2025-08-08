import requests
import random
import time
from datetime import datetime, timedelta, timezone

BASE_URL = "http://localhost:3000/stage-update"

STAGES = [
    "video_to_audio",
    "audio_to_text",
    "text_translate",
    "text_to_audio",
    "merge_audio_video"
]

# Create consistent, ordered timestamps
def generate_timeline(start_time, spacing_seconds=3, duration=2):
    timeline = []
    for i, stage in enumerate(STAGES):
        start = start_time + timedelta(seconds=i * spacing_seconds)
        end = start + timedelta(seconds=duration)
        timeline.append({
            "stage_name": stage,
            "start_time": start.isoformat(),
            "end_time": end.isoformat()
        })
    return timeline

def send_event(stage_name, status, timestamp):
    payload = {
        "stage_name": stage_name,
        "status": status,
        "timestamp": timestamp
    }
    res = requests.post(BASE_URL, json=payload)
    print(f"[{status.upper()}] {stage_name} @ {timestamp} → {res.status_code}")

# Step 1: Reset backend
requests.post("http://localhost:3000/reset")
print("Backend reset.")
time.sleep(1)

# Step 2: Generate ordered timeline
now = datetime.now(timezone.utc)
events = []
timeline = generate_timeline(now)

for entry in timeline:
    events.append((entry["stage_name"], "started", entry["start_time"]))
    events.append((entry["stage_name"], "completed", entry["end_time"]))

# Step 3: Shuffle events to simulate async
random.shuffle(events)

# Step 4: Send events with slight delay
for stage_name, status, ts in events:
    send_event(stage_name, status, ts)
    time.sleep(0.5)

# Final completion marker
complete_time = (now + timedelta(seconds=15)).isoformat()
send_event("complete", "started", complete_time)
send_event("complete", "completed", (datetime.now(timezone.utc) + timedelta(seconds=1)).isoformat())

print("✅ Async simulation complete.")

