import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const VoiceCommandButton = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");

  const toggleListening = () => {
    if (!isListening) {
      setIsListening(true);
      toast.success("Voice command activated! Speak now...");
      
      // Simulate voice recognition
      setTimeout(() => {
        setTranscript("Inventory check karo");
        setTimeout(() => {
          setIsListening(false);
          setTranscript("");
          toast.info("Command received: Checking inventory...");
        }, 2000);
      }, 1500);
    } else {
      setIsListening(false);
      setTranscript("");
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