import { useState, useRef, useEffect, useCallback } from "react";

export function useSpeechRecognition({ onTranscriptChange }) {
  const [isListening, setIsListening] = useState(false);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(null);
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
    setActiveQuestionIndex(null);
  }, []);

  const startListening = useCallback(
    (questionIndex, currentText = "") => {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      if (!SpeechRecognition) {
        alert("Speech Recognition is not supported by your browser. Please type your answer.");
        return;
      }

      if (isListening && activeQuestionIndex === questionIndex) {
        stopListening();
        return;
      }

      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }

      const recognition = new SpeechRecognition();
      recognition.lang = "en-IN";
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
        setActiveQuestionIndex(questionIndex);
      };

      recognition.onresult = (event) => {
        let transcript = "";
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript + " ";
        }
        if (onTranscriptChange) {
          onTranscriptChange(questionIndex, (currentText ? currentText + " " : "") + transcript.trim());
        }
      };

      recognition.onerror = (err) => {
        console.warn("Speech recognition error:", err.error);
        stopListening();
      };

      recognition.onend = () => {
        setIsListening(false);
        setActiveQuestionIndex(null);
      };

      recognitionRef.current = recognition;
      recognition.start();
    },
    [isListening, activeQuestionIndex, onTranscriptChange, stopListening]
  );

  return {
    isSupported,
    isListening,
    activeQuestionIndex,
    startListening,
    stopListening
  };
}

