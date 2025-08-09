# 📘 Service Lingo Backend API

This API is designed to receive stage updates from a Lambda-based video processing pipeline and reflect them in the frontend via polling. It returns real-time stage progress and output links.

---

## 🔁 POST `/trigger`

### Starts a new session

**Request Body:**

```json
{
  "video_link": "https://s3.amazonaws.com/your-bucket/input.mp4"
}
```

**Response:**

```json
{
  "success": true
}
```

> Calling this clears all previous state and begins a new processing session.

---

## 📦 POST `/stage-update`

### Updates backend with each pipeline stage's status

**Request Body:**

```json
{
  "stage_name": "audio_to_text",
  "status": "started" | "completed",
  "timestamp": "2025-08-08T12:00:00Z",
  "output_link": "https://s3.amazonaws.com/your-bucket/output.mp4" // optional
}
```

| Field         | Required | Description                                                                 |
|---------------|----------|-----------------------------------------------------------------------------|
| `stage_name`  | ✅       | One of: `video_to_audio`, `audio_to_text`, `text_translate`, `text_to_audio`, `merge_audio_video` |
| `status`      | ✅       | `"started"` or `"completed"`                                                |
| `timestamp`   | ✅       | ISO 8601 UTC timestamp                                                       |
| `output_link` | ❌       | Only required in final stage (`merge_audio_video`)                          |

**Response:**

```json
{
  "success": true
}
```

---

## 📊 GET `/stage-status`

### Returns the current progress for frontend polling

**Response:**

```json
{
  "current_stage": {
    "stage_name": "text_translate",
    "status": "started",
    "start_time": "2025-08-08T12:00:00Z"
  },
  "history": [
    {
      "stage_name": "video_to_audio",
      "start_time": "...",
      "end_time": "..."
    },
    ...
  ],
  "total_duration": {
    "start": "...",
    "end": "..."
  },
  "video_link": "https://s3.amazonaws.com/your-bucket/input.mp4",
  "output_link": "https://s3.amazonaws.com/your-bucket/output.mp4",
  "session_active": true
}
```

---

## 🔄 POST `/reset`

### Clears all session data

**Response:**

```json
{
  "success": true
}
```

---

## ✅ Integration Example (AWS Lambda)

```ts
await fetch("http://<backend-host>:3000/stage-update", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    stage_name: "text_translate",
    status: "started",
    timestamp: new Date().toISOString()
  })
});
```

And final completion with output link:

```ts
await fetch("http://<backend-host>:3000/stage-update", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    stage_name: "merge_audio_video",
    status: "completed",
    timestamp: new Date().toISOString(),
    output_link: "https://s3.amazonaws.com/my-bucket/final-output.mp4"
  })
});
```

---

## 💡 Developer Notes

- Always use ISO 8601 timestamps (`new Date().toISOString()`)
- Trigger the session exactly once per file via `/trigger`
- Use `/stage-update` throughout the pipeline
- Set `output_link` only on the final stage
- Frontend polls `/stage-status` every 2s to update UI
- `/reset` is optional but useful during testing
