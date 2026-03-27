import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Loader2, Clock, Sparkles } from "lucide-react";

const Card = ({ children, className = "" }: any) => (
  <div className={`rounded-xl shadow-sm p-4 border ${className}`}>{children}</div>
);

const CardContent = ({ children, className = "" }: any) => (
  <div className={`flex flex-col gap-1 ${className}`}>{children}</div>
);

const stages = [
  { key: "video_to_audio", title: "Video to Audio" },
  { key: "audio_to_text", title: "Audio to Text" },
  { key: "text_translate", title: "Text Translation" },
  { key: "text_to_audio", title: "Text to Audio" },
  { key: "merge_audio_video", title: "Audio to Video" }
];

const ProjectProgress = () => {
  const [progressData, setProgressData] = useState<any>({});
  const [isConnected, setIsConnected] = useState(false);
  const [completedRecently, setCompletedRecently] = useState(false);
  const [videoLink, setVideoLink] = useState("");
  const [outputLink, setOutputLink] = useState<string | null>(null);
  const [isSessionDone, setIsSessionDone] = useState(false);

  // useEffect(() => {
  //   const fetchStageStatus = async () => {
  //     try {
  //       const res = await fetch("http://localhost:3000/stage-status");
  //       const data = await res.json();
  //       setProgressData(data);
  //       setIsConnected(true);

  //       if (data.output_link) {
  //         setOutputLink(data.output_link);
  //       }

  //       const allDone = stages.every(stage => data.history?.some((s: any) => s.stage_name === stage.key && s.end_time));
  //       if (allDone && !completedRecently) {
  //         setCompletedRecently(true);
  //         setIsSessionDone(true);
  //       }
  //     } catch (e) {
  //       console.error("Failed to fetch stage status", e);
  //       setIsConnected(false);
  //     }
  //   };
  //   const interval = setInterval(fetchStageStatus, 2000);
  //   return () => clearInterval(interval);
  // }, [completedRecently]);
  // useEffect(() => {
  //   if (!progressData.video_link && !videoLink) return; // block polling if no trigger
  
  //   const fetchStageStatus = async () => {
  //     try {
  //       const res = await fetch("http://localhost:3000/stage-status");
  //       const data = await res.json();
  //       setProgressData(data);
  //       setIsConnected(true);
  
  //       if (data.output_link) {
  //         setOutputLink(data.output_link);
  //       }
  
  //       const allDone = stages.every(stage =>
  //         data.history?.some((s: any) => s.stage_name === stage.key && s.end_time)
  //       );
  //       if (allDone && !completedRecently) {
  //         setCompletedRecently(true);
  //         setIsSessionDone(true);
  //       }
  //     } catch (e) {
  //       console.error("Failed to fetch stage status", e);
  //       setIsConnected(false);
  //     }
  //   };
  
  //   const interval = setInterval(fetchStageStatus, 2000);
  //   return () => clearInterval(interval);
  // }, [completedRecently, videoLink, progressData.video_link]);

  useEffect(() => {
    const fetchStageStatus = async () => {
      try {
        const res = await fetch("http://localhost:3000/stage-status");
        const data = await res.json();
        setIsConnected(true);
  
        // Only set full progress if trigger was run
        if (data.video_link) {
          setProgressData(data);
  
          if (data.output_link) {
            setOutputLink(data.output_link);
          }
  
          const allDone = stages.every(stage =>
            data.history?.some((s: any) => s.stage_name === stage.key && s.end_time)
          );
          if (allDone && !completedRecently) {
            setCompletedRecently(true);
            setIsSessionDone(true);
          }
        }
      } catch (e) {
        console.error("Failed to fetch stage status", e);
        setIsConnected(false);
      }
    };
  
    const interval = setInterval(fetchStageStatus, 2000);
    return () => clearInterval(interval);
  }, [completedRecently]);
  
  
  

  const handleSubmit = async () => {
    if (!videoLink) return;
    try {
      await fetch("http://localhost:3000/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ video_link: videoLink })
      });
      setVideoLink("");
      setProgressData({});
      setOutputLink(null);
      setCompletedRecently(false);
      setIsSessionDone(false);
    } catch (e) {
      console.error("Failed to trigger translation", e);
    }
  };

  const getElapsedTime = (start: string, end: string) => {
    const diff = new Date(end).getTime() - new Date(start).getTime();
    return `${Math.round(diff / 1000)}s`;
  };

  const completedMap = Object.fromEntries(
    (progressData.history || []).map((stage: any) => [stage.stage_name, stage])
  );
  const currentKey = progressData.current_stage?.stage_name;

  const actualStart = completedMap["video_to_audio"]?.start_time;
  const actualEnd = completedMap["merge_audio_video"]?.end_time;

  const isFullyComplete = stages.every(stage => completedMap[stage.key]?.end_time);

  const getDisplayState = (stageKey: string) => {
    const data = completedMap[stageKey];
    const isComplete = data?.start_time && data?.end_time;
    const isActive = currentKey === stageKey;
    return { isComplete, isActive };
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-indigo-50 py-10 px-4 md:px-10 max-w-3xl mx-auto">
      
      <div className="flex justify-end mb-6">
        <button
          onClick={async () => {
            await fetch("http://localhost:3000/reset", { method: "POST" });
            setVideoLink("");
            setProgressData({});
            setOutputLink(null);
            setCompletedRecently(false);
            setIsSessionDone(false);
          }}
          className="text-sm text-red-600 underline hover:text-red-800 text-right"
        >
          🔄 Reset UI
        </button>
      </div>


      <h1 className="text-3xl font-bold text-indigo-600 text-center mb-8">✨ Service Lingo ✨</h1>

      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-3">🎬 Translate a Video</h2>
        <input
          type="text"
          placeholder="Paste S3 video link..."
          value={videoLink}
          onChange={(e) => setVideoLink(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md mb-4"
        />
        <button
          onClick={handleSubmit}
          className="w-full py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition text-lg font-semibold"
        >
          Translate Video
        </button>

        {completedRecently && outputLink && (
          <div className="mt-6 text-center">
            <h3 className="text-md font-medium text-gray-700 mb-2">✅ Translated Output</h3>
            <a
              href={outputLink}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-block font-medium px-6 py-3 rounded-md text-lg transition ${isFullyComplete ? "bg-indigo-600 text-white hover:bg-indigo-700" : "bg-gray-300 text-white cursor-not-allowed"}`}
              style={{ pointerEvents: isFullyComplete ? "auto" : "none" }}
            >
              Download Translated Video ↗
            </a>
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-medium text-gray-800">Overall Progress</h2>
          {/* <span className="text-sm text-gray-500">
            {isFullyComplete ? `100% Complete${actualStart && actualEnd ? ` • Total Time: ${getElapsedTime(actualStart, actualEnd)}` : ""}` : "In Progress"}
          </span> */}
          <span className="text-sm text-gray-500">
            {!progressData.history?.length
            ? ""
            : isFullyComplete
            ? `100% Complete${actualStart && actualEnd ? ` • Total Time: ${getElapsedTime(actualStart, actualEnd)}` : ""}`
            : "In Progress"}
          </span>
        </div>
        <div className="w-full h-3 bg-gray-200 rounded-full">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${isFullyComplete ? "bg-indigo-400 w-full" : "bg-gray-300 w-0"}`}
          ></div>
        </div>
      </div>

      <div className="space-y-4">
        {stages.map((stage) => {
          const data = completedMap[stage.key];
          const { isComplete, isActive } = getDisplayState(stage.key);

          return (
            <Card
              key={stage.key}
              className={`flex items-center gap-4 ${
                isComplete
                  ? "border-green-500 bg-green-50"
                  : isActive
                  ? "border-yellow-400 bg-yellow-50"
                  : "border-gray-200 bg-white"
              }`}
            >
              <div className="text-xl">
                {isComplete ? (
                  <CheckCircle className="text-green-500" size={24} />
                ) : isActive ? (
                  <Loader2 className="animate-spin text-yellow-500" size={24} />
                ) : (
                  <Clock className="text-gray-400" size={24} />
                )}
              </div>
              <CardContent>
                <p className="text-sm font-semibold text-gray-800">{stage.title}</p>
                <p className="text-xs text-gray-500">
                  {isComplete && data?.start_time && data?.end_time
                    ? `Time: ${getElapsedTime(data.start_time, data.end_time)}`
                    : "Waiting"}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {completedRecently && (
        <div className="text-center mt-10">
          <Sparkles className="mx-auto text-indigo-500 animate-bounce" size={48} />
          <h2 className="text-xl font-bold text-indigo-700 mt-4">Pipeline Complete!</h2>
          {actualStart && actualEnd && (
            <p className="text-sm text-gray-600 mt-2">
              Total Time: {getElapsedTime(actualStart, actualEnd)}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectProgress;
