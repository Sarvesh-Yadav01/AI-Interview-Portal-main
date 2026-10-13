import { useState, useRef, useEffect, useCallback } from "react";

export function useProctoring({ onTerminate, maxWarnings = 3 }) {
  const [isActive, setIsActive] = useState(false);
  const [warningCount, setWarningCount] = useState(0);
  const [securityEvents, setSecurityEvents] = useState([]);
  const [webcamEnabled, setWebcamEnabled] = useState(false);
  const [screenShareEnabled, setScreenShareEnabled] = useState(false);

  const videoRef = useRef(null);
  const screenStreamRef = useRef(null);
  const cameraStreamRef = useRef(null);
  const isTerminatedRef = useRef(false);

  const logEvent = useCallback((msg) => {
    const entry = `${new Date().toISOString()} - ${msg}`;
    setSecurityEvents((prev) => [...prev, entry]);
    return entry;
  }, []);

  const triggerTermination = useCallback(
    (reason) => {
      if (isTerminatedRef.current) return;
      isTerminatedRef.current = true;
      logEvent(reason);
      if (onTerminate) {
        onTerminate(reason);
      }
    },
    [logEvent, onTerminate]
  );

  const issueWarning = useCallback(
    (reason) => {
      setWarningCount((prev) => {
        const next = prev + 1;
        logEvent(`Warning ${next}/${maxWarnings}: ${reason}`);
        if (next >= maxWarnings) {
          triggerTermination(`Exceeded security warning limit (${maxWarnings}). Reason: ${reason}`);
        } else {
          alert(`Security Warning (${next}/${maxWarnings}): ${reason}`);
        }
        return next;
      });
    },
    [logEvent, maxWarnings, triggerTermination]
  );

  const enableProctoring = async () => {
    try {
      // 1. Get Screen Sharing
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false
      });
      screenStreamRef.current = screenStream;
      setScreenShareEnabled(true);

      // 2. Get Camera
      const cameraStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false
      });
      cameraStreamRef.current = cameraStream;
      setWebcamEnabled(true);

      if (videoRef.current) {
        videoRef.current.srcObject = cameraStream;
      }

      // Track listeners
      const screenTrack = screenStream.getVideoTracks()[0];
      const cameraTrack = cameraStream.getVideoTracks()[0];

      screenTrack.onended = () => {
        triggerTermination("Screen sharing was stopped.");
      };

      cameraTrack.onended = () => {
        triggerTermination("Webcam camera stream was disconnected.");
      };

      setIsActive(true);
      logEvent("Camera and screen sharing successfully activated.");
      return true;
    } catch (err) {
      logEvent("Candidate denied camera or screen sharing permissions.");
      alert("Camera and screen sharing permissions are required to begin the exam.");
      return false;
    }
  };

  // Anti-cheat window blur & visibility listeners
  useEffect(() => {
    if (!isActive) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        triggerTermination("Candidate switched browser tabs or minimized the exam window.");
      }
    };

    const handleWindowBlur = () => {
      issueWarning("Candidate switched focus away from the test window.");
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
    };
  }, [isActive, triggerTermination, issueWarning]);

  // Clean up streams on unmount
  useEffect(() => {
    return () => {
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return {
    isActive,
    videoRef,
    warningCount,
    securityEvents,
    webcamEnabled,
    screenShareEnabled,
    enableProctoring,
    logEvent
  };
}

