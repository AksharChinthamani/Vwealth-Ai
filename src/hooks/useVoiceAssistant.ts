import { useState, useRef, useCallback } from "react";
import { ConversationMessage } from "../types";

type VoiceState = "idle" | "recording" | "thinking" | "speaking";

export const useVoiceAssistant = () => {
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [liveText, setLiveText] = useState("");
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const recogRef = useRef<any>(null);

  const speak = useCallback((text: string) => {
    window.speechSynthesis?.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.05;
    utterance.onend = () => setVoiceState("idle");
    window.speechSynthesis?.speak(utterance);
  }, []);

  const startRecording = useCallback((onResult: (text: string) => void) => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      setLiveText("Speech not supported. Please type.");
      return;
    }

    setLiveText("");
    setVoiceState("recording");
    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = "en-US";

    let finalText = "";
    let lastInterim = "";

    rec.onresult = (e: any) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) {
          finalText += e.results[i][0].transcript;
        } else {
          interim += e.results[i][0].transcript;
        }
      }
      lastInterim = interim;
      setLiveText((finalText + " " + interim).trim());
    };

    rec.onend = () => {
      const fullText = (finalText + " " + lastInterim).trim();
      if (fullText.length > 1) {
        setVoiceState("thinking");
        onResult(fullText);
      } else {
        setVoiceState("idle");
        setLiveText("Didn't catch that. Try again.");
      }
    };

    rec.onerror = () => {
      setVoiceState("idle");
      setLiveText("Mic error. Please type instead.");
    };

    try {
      rec.start();
      recogRef.current = rec;
    } catch (e) {
      console.error(e);
    }
  }, []);

  const stopRecording = useCallback(() => {
    try {
      recogRef.current?.stop();
    } catch (_) {
      // Silent fail
    }
  }, []);

  const addMessage = useCallback((message: ConversationMessage) => {
    setConversation((prev) => [...prev, message]);
  }, []);

  const resetConversation = useCallback(() => {
    setConversation([]);
    setLiveText("");
    setVoiceState("idle");
    window.speechSynthesis?.cancel();
  }, []);

  return {
    voiceState,
    setVoiceState,
    liveText,
    setLiveText,
    conversation,
    setConversation,
    startRecording,
    stopRecording,
    speak,
    addMessage,
    resetConversation,
  };
};
