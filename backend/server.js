// const express = require('express');
// const cors = require('cors');
// const fs = require('fs');
// const path = require('path');
// const app = express();
// const PORT = 3000;

// app.use(cors());
// app.use(express.json());

// const savePath = path.join(__dirname, 'stage_data.json');

// let stageData = {
//   current_stage: null,
//   history: [],
//   total_duration: null
// };

// const saveData = () => {
//   fs.writeFileSync(savePath, JSON.stringify(stageData, null, 2));
// };

// const reset = () => {
//   stageData = { current_stage: null, history: [], total_duration: null };
//   saveData();
// };

// if (fs.existsSync(savePath)) {
//   stageData = JSON.parse(fs.readFileSync(savePath));
// }

// // app.post('/stage-update', (req, res) => {
// //   const { stage_name, status, timestamp } = req.body;

// //   if (!stage_name || !status || !timestamp) {
// //     return res.status(400).send({ error: 'Missing stage_name, status, or timestamp' });
// //   }

// //   if (status === 'started') {
// //     stageData.current_stage = {
// //       stage_name,
// //       status,
// //       start_time: timestamp
// //     };

// //     if (stage_name === 'video_to_audio') {
// //       stageData.total_duration = { start: timestamp, end: null };
// //     }
// //   }

// //   if (status === 'completed' && stageData.current_stage?.stage_name === stage_name) {
// //     const entry = {
// //       ...stageData.current_stage,
// //       status: 'completed',
// //       end_time: timestamp
// //     };

// //     const alreadyCompleted = stageData.history.some(s => s.stage_name === stage_name);

// //     if (!alreadyCompleted) {
// //       stageData.history.push(entry);
// //     }

// //     stageData.current_stage = null;

// //     if (stage_name === 'complete' && stageData.total_duration) {
// //       stageData.total_duration.end = timestamp;

// //       setTimeout(() => {
// //         reset();
// //       }, 5000);
// //     }
// //   }

// //   saveData();
// //   res.send({ success: true });
// // });

// app.post('/stage-update', (req, res) => {
//   const { stage_name, status, timestamp } = req.body;

//   if (!stage_name || !status || !timestamp) {
//     return res.status(400).send({ error: 'Missing stage_name, status, or timestamp' });
//   }

//   if (!stageData.history) stageData.history = [];

//   const existing = stageData.history.find(s => s.stage_name === stage_name);

//   if (status === 'started') {
//     if (existing) {
//       existing.start_time = timestamp;
//     } else {
//       stageData.history.push({ stage_name, start_time: timestamp });
//     }

//     if (stage_name === 'video_to_audio') {
//       stageData.total_duration = { start: timestamp, end: null };
//     }

//     stageData.current_stage = { stage_name, status, start_time: timestamp };
//   }

//   if (status === 'completed') {
//     if (existing) {
//       existing.end_time = timestamp;
//     } else {
//       stageData.history.push({ stage_name, end_time: timestamp });
//     }

//     if (stage_name === 'merge_audio_video' && stageData.total_duration) {
//       stageData.total_duration.end = timestamp;
//     }

//     if (stageData.current_stage?.stage_name === stage_name) {
//       stageData.current_stage = null;
//     }
//   }

//   saveData();
//   res.send({ success: true });
// });


// app.get('/stage-status', (req, res) => {
//   res.json(stageData);
// });

// app.post('/reset', (req, res) => {
//   reset();
//   res.send({ success: true });
// });

// app.listen(PORT, () => {
//   console.log(`✅ Server running at http://localhost:${PORT}`);
// });
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const savePath = path.join(__dirname, 'stage_data.json');

let stageData = {
  current_stage: null,
  history: [],
  total_duration: null,
  video_link: null,
  output_link: null,
  session_active: false
};

const saveData = () => {
  fs.writeFileSync(savePath, JSON.stringify(stageData, null, 2));
};

const reset = () => {
  stageData = {
    current_stage: null,
    history: [],
    total_duration: null,
    video_link: null,
    output_link: null,
    session_active: false
  };
  saveData();
};

if (fs.existsSync(savePath)) {
  stageData = JSON.parse(fs.readFileSync(savePath));
}

app.post('/trigger', (req, res) => {
  const { video_link } = req.body;
  if (!video_link) {
    return res.status(400).json({ error: 'Missing video_link' });
  }
  reset();
  stageData.video_link = video_link;
  stageData.session_active = true
  saveData();

  console.log(`🚀 Trigger received for video: ${video_link}`);
  return res.json({ success: true });
});

app.post('/stage-update', (req, res) => {
  const { stage_name, status, timestamp, output_link } = req.body;

  if (!stage_name || !status || !timestamp) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const existing = stageData.history.find(s => s.stage_name === stage_name);

  if (status === 'started') {
    if (existing) {
      existing.start_time = timestamp;
    } else {
      stageData.history.push({ stage_name, start_time: timestamp });
    }

    if (stage_name === 'video_to_audio') {
      stageData.total_duration = { start: timestamp, end: null };
    }

    stageData.current_stage = { stage_name, status, start_time: timestamp };
  }

  if (status === 'completed') {
    if (existing) {
      existing.end_time = timestamp;
    } else {
      stageData.history.push({ stage_name, end_time: timestamp });
    }

    if (stage_name === 'merge_audio_video' && stageData.total_duration) {
      stageData.total_duration.end = timestamp;
      stageData.session_active = false; 
    }

    if (stageData.current_stage?.stage_name === stage_name) {
      stageData.current_stage = null;
    }

    if (output_link) {
      stageData.output_link = output_link;
    }
  }

  saveData();
  return res.json({ success: true });
});

app.get('/stage-status', (req, res) => {
  res.json(stageData);
});

app.post('/reset', (req, res) => {
  reset();
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
