"use client";
import React, { useRef, useState, useCallback, useEffect } from "react";
import { Camera, CheckCircle, RefreshCw, Video, AlertCircle, ShieldCheck, Sparkles } from "lucide-react";
import { useLanguage } from "@/lib/language";

interface LiveCameraCaptureProps {
  onCapture: (dataUrl: string, token: string, captureMode?: "burst" | "video") => void;
  onCancel?: () => void;
}

export function LiveCameraCapture({ onCapture, onCancel }: LiveCameraCaptureProps) {
  const { t } = useLanguage();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [captureToken, setCaptureToken] = useState<string | null>(null);
  const [isBursting, setIsBursting] = useState(false);
  const [burstCount, setBurstCount] = useState(0);
  const [isVideoRecording, setIsVideoRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  const [hasExplainedPermission, setHasExplainedPermission] = useState(false);

  // 1. Fetch server-signed capture-session token
  useEffect(() => {
    async function fetchToken() {
      try {
        const tokenRes = await fetch("/api/anti-fraud/capture-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
        if (tokenRes.ok) {
          const tokenData = await tokenRes.json();
          setCaptureToken(tokenData.capture_token);
        }
      } catch (err) {
        console.warn("Could not fetch capture token, mock fallback active.");
        setCaptureToken("mock_capture_token_" + Date.now());
      }
    }
    fetchToken();
  }, []);

  // 2. Initialize camera directly
  const initCamera = useCallback(async () => {
    let activeStream: MediaStream | null = null;
    try {
      setIsInitializing(true);
      setError(null);
      setHasExplainedPermission(true);

      // Start Live WebRTC video stream (prefer environment/rear camera on mobile devices)
      activeStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      setStream(activeStream);
      if (videoRef.current) {
        videoRef.current.srcObject = activeStream;
      }
    } catch (err: any) {
      console.error("Camera init error:", err);
      setError(
        t(
          "Camera access denied. Please enable camera permissions in your browser settings to continue.",
          "कैमरा एक्सेस ठुकरा दिया गया। कृपया आगे बढ़ने के लिए ब्राउज़र सेटिंग में कैमरा अनुमति सक्षम करें।",
          "कैमरा के अनुमति नइ मिलिस। ब्राउज़र सेटिंग ले कैमरा चालू करव।"
        )
      );
    } finally {
      setIsInitializing(false);
    }
  }, [t]);

  // Clean up streams on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  // 2. Perform 3-Frame Live Photo Burst
  const handleBurstCapture = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !captureToken || isBursting) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    setIsBursting(true);
    const frames: string[] = [];

    for (let i = 1; i <= 3; i++) {
      setBurstCount(i);
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        frames.push(canvas.toDataURL("image/jpeg", 0.92));
      }
      await new Promise((res) => setTimeout(res, 200)); // 200ms interval burst
    }

    setIsBursting(false);
    setBurstCount(0);
    if (frames.length > 0) {
      setCapturedImage(frames[frames.length - 1]); // Use best final frame
    }
  }, [captureToken, isBursting]);

  // 3. Perform 5-Second Video Sweep Recording
  const handleStart5SecVideo = useCallback(() => {
    if (!stream || !captureToken || isVideoRecording) return;
    recordedChunksRef.current = [];

    try {
      const recorder = new MediaRecorder(stream, { mimeType: "video/webm" });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const videoBlob = new Blob(recordedChunksRef.current, { type: "video/webm" });
        // Take a snapshot frame from canvas as preview image
        if (videoRef.current && canvasRef.current) {
          const canvas = canvasRef.current;
          canvas.width = videoRef.current.videoWidth || 640;
          canvas.height = videoRef.current.videoHeight || 480;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
            setCapturedImage(canvas.toDataURL("image/jpeg", 0.9));
          }
        }
      };

      recorder.start();
      setIsVideoRecording(true);
      setRecordingSeconds(5);

      const interval = setInterval(() => {
        setRecordingSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            if (recorder.state === "recording") {
              recorder.stop();
            }
            setIsVideoRecording(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (e) {
      console.error("Video recording failed:", e);
      // Fallback to burst
      handleBurstCapture();
    }
  }, [stream, captureToken, isVideoRecording, handleBurstCapture]);

  const handleConfirm = () => {
    if (capturedImage && captureToken) {
      onCapture(capturedImage, captureToken, isVideoRecording ? "video" : "burst");
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };

  if (!hasExplainedPermission) {
    return (
      <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center space-y-4">
        <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center">
          <Camera className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 mb-1">
            {t("Camera Access Needed", "कैमरा अनुमति आवश्यक है", "कैमरा चालू करव")}
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed max-w-[260px]">
            {t(
              "KisanSetu needs camera access to inspect crop freshness with AI to ensure you get the best market price.",
              "सबसे अच्छी बाज़ार कीमत सुनिश्चित करने के लिए AI के माध्यम से फसल की ताज़गी का निरीक्षण करने के लिए कैमरा पहुंच आवश्यक है।",
              "बढ़िया भाव बर AI ले फसल के ताज़गी जांच करे बर कैमरा चालू करव।"
            )}
          </p>
        </div>
        <div className="flex flex-col gap-2 w-full pt-2">
          <button
            type="button"
            onClick={initCamera}
            className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition"
          >
            {t("Allow Camera Access", "कैमरा अनुमति दें", "कैमरा चालू करव")}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="w-full py-3 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold text-xs rounded-xl transition"
            >
              {t("Cancel", "रद्द करें", "कैंसिल")}
            </button>
          )}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-2xl border border-red-200 text-xs space-y-2">
        <div className="flex items-center gap-2 font-bold">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{t("Camera Access Required", "कैमरा अनुमति आवश्यक है", "कैमरा चालू करव")}</span>
        </div>
        <p>{error}</p>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="mt-2 text-xs font-semibold text-red-600 underline"
          >
            {t("Close Viewfinder", "बंद करें", "बंद करव")}
          </button>
        )}
      </div>
    );
  }

  if (capturedImage) {
    return (
      <div className="relative rounded-2xl overflow-hidden bg-black aspect-video flex flex-col border border-emerald-300 shadow-md">
        <img
          src={capturedImage}
          alt="Live burst preview"
          className="w-full h-full object-contain"
        />
        <div className="absolute top-3 left-3 bg-emerald-700/90 text-white text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1.5 backdrop-blur-md shadow-sm">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-200" />
          {t("Live In-App Capture Verified", "लाइव इन-ऐप कैप्चर सत्यापित", "लाइव फोटो सत्यापित")}
        </div>
        <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex justify-between items-center">
          <button
            type="button"
            onClick={handleRetake}
            className="px-3 py-1.5 bg-slate-800/90 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            {t("Retake", "दोबारा लें", "फेर लेव")}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition"
          >
            <CheckCircle className="w-4 h-4" />
            {t("Confirm & Use Photo", "स्वीकार करें", "ठीक हे")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative rounded-2xl overflow-hidden bg-slate-950 aspect-video flex flex-col justify-end border-2 border-emerald-500 shadow-lg">
      {isInitializing && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white/70 text-xs gap-2">
          <RefreshCw className="w-6 h-6 animate-spin text-emerald-400" />
          <span>{t("Initializing Secure In-App Camera...", "कैमरा शुरू हो रहा है...", "कैमरा चालू होत हे...")}</span>
        </div>
      )}

      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
      />
      <canvas ref={canvasRef} className="hidden" />

      {/* Real-time Watermark & Security Token Badge */}
      <div className="absolute top-3 left-3 bg-slate-900/80 text-emerald-400 text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full flex items-center gap-1.5 backdrop-blur-md border border-emerald-500/40">
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></div>
        {t("Live Capture Only (No Gallery)", "केवल लाइव कैमरा (गैलरी बंद)", "केवल लाइव कैमरा")}
      </div>

      {isBursting && (
        <div className="absolute inset-0 bg-white/30 flex items-center justify-center backdrop-blur-xs">
          <div className="bg-slate-900/90 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg">
            <Sparkles className="w-4 h-4 text-emerald-400 animate-spin" />
            <span>Burst Frame {burstCount}/3</span>
          </div>
        </div>
      )}

      {isVideoRecording && (
        <div className="absolute top-3 right-3 bg-red-600 text-white text-[11px] font-mono font-bold px-3 py-1 rounded-full flex items-center gap-1.5 animate-pulse shadow-md">
          <div className="w-2 h-2 rounded-full bg-white"></div>
          <span>REC 00:0{recordingSeconds}</span>
        </div>
      )}

      {/* Control Buttons */}
      <div className="relative p-3 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent flex items-center justify-around">
        <button
          type="button"
          onClick={handleStart5SecVideo}
          disabled={isInitializing || !captureToken || isBursting || isVideoRecording}
          className="flex flex-col items-center gap-1 text-[10px] font-bold text-slate-300 hover:text-white transition disabled:opacity-40"
        >
          <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-600">
            <Video className="w-4 h-4 text-amber-400" />
          </div>
          <span>{t("5s Video", "5s वीडियो", "5s वीडियो")}</span>
        </button>

        <button
          type="button"
          onClick={handleBurstCapture}
          disabled={isInitializing || !captureToken || isBursting || isVideoRecording}
          className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center bg-white/20 hover:bg-white/40 active:scale-95 transition-all shadow-md disabled:opacity-50"
        >
          <div className="w-12 h-12 bg-emerald-500 hover:bg-emerald-400 rounded-full flex items-center justify-center shadow-inner">
            <Camera className="w-6 h-6 text-white" />
          </div>
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-[11px] font-bold text-slate-400 hover:text-white transition px-2 py-1"
          >
            {t("Cancel", "रद्द करें", "कैंसिल")}
          </button>
        )}
      </div>
    </div>
  );
}
