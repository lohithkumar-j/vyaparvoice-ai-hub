import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const VoiceCommandButton = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check if browser supports Speech Recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'hi-IN'; // Hindi

      recognitionRef.current.onresult = (event: any) => {
        const current = event.resultIndex;
        const transcriptText = event.results[current][0].transcript;
        setTranscript(transcriptText);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        if (transcript) {
          processVoiceCommand(transcript);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast.error(`Voice error: ${event.error}`);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [transcript]);

  const processVoiceCommand = (command: string) => {
    const lowerCommand = command.toLowerCase();
    
    if (lowerCommand.includes('inventory') || lowerCommand.includes('stock') || lowerCommand.includes('माल')) {
      toast.success("Opening inventory view...");
      setTimeout(() => setTranscript(""), 2000);
    } else if (lowerCommand.includes('customer') || lowerCommand.includes('ग्राहक') || lowerCommand.includes('खाता')) {
      toast.success("Opening customer ledger...");
      setTimeout(() => setTranscript(""), 2000);
    } else if (lowerCommand.includes('analytics') || lowerCommand.includes('report') || lowerCommand.includes('बिक्री')) {
      toast.success("Opening analytics...");
      setTimeout(() => setTranscript(""), 2000);
    } else {
      toast.info(`Command received: ${command}`);
      setTimeout(() => setTranscript(""), 2000);
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast.error("Voice recognition not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    if (!isListening) {
      setTranscript("");
      setIsListening(true);
      recognitionRef.current.start();
      toast.success("Listening... Speak in Hindi or English!");
    } else {
      setIsListening(false);
      recognitionRef.current.stop();
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <motion.div
        animate={{
          scale: isListening ? [1, 1.1, 1] : 1,
        }}
        transition={{
          duration: 1,
          repeat: isListening ? Infinity : 0,
        }}
      >
        <Button
          size="lg"
          onClick={toggleListening}
          className={`w-32 h-32 rounded-full text-white transition-all duration-300 ${
            isListening
              ? "bg-gradient-to-r from-destructive to-primary glow-primary"
              : "bg-gradient-to-r from-primary to-secondary glow-primary"
          }`}
        >
          {isListening ? (
            <MicOff className="w-16 h-16" />
          ) : (
            <Mic className="w-16 h-16" />
          )}
        </Button>
      </motion.div>

      <div className="text-center">
        <h3 className="text-2xl font-semibold mb-2">
          {isListening ? "Listening..." : "Tap to Speak"}
        </h3>
        <p className="text-muted-foreground">
          {isListening ? "Say your command in Hindi or English" : "Voice commands in Hindi & English"}
        </p>
      </div>

      <AnimatePresence>
        {transcript && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="glass-card px-8 py-4 rounded-xl max-w-md"
          >
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">You said:</p>
              <p className="text-lg font-medium">{transcript}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VoiceCommandButton;