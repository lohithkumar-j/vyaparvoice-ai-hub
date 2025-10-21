import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const PosterGenerator = () => {
  const [businessName, setBusinessName] = useState("");
  const [offer, setOffer] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [posterUrl, setPosterUrl] = useState<string | null>(null);

  const generatePoster = async () => {
    if (!businessName.trim()) {
      toast.error("Please enter your business name");
      return;
    }

    setIsGenerating(true);
    setPosterUrl(null);

    try {
      const { data, error } = await supabase.functions.invoke('generate-poster', {
        body: {
          businessName,
          offer: offer.trim() || "Special offers available!",
        },
      });

      if (error) throw error;

      if (data?.error) {
        toast.error(data.error);
        return;
      }

      setPosterUrl(data.imageUrl);
      toast.success("Poster generated successfully!");
    } catch (error) {
      console.error('Error generating poster:', error);
      toast.error("Failed to generate poster. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadPoster = () => {
    if (!posterUrl) return;
    
    const link = document.createElement('a');
    link.href = posterUrl;
    link.download = `${businessName}-poster.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Poster downloaded!");
  };

  return (
    <div className="glass-card p-6 rounded-2xl">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-success" />
        </div>
        <h2 className="text-xl font-bold">Marketing Poster Generator</h2>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Business Name</label>
          <Input
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            placeholder="Enter your shop name"
            className="bg-background/50"
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Offer Details (Optional)</label>
          <Textarea
            value={offer}
            onChange={(e) => setOffer(e.target.value)}
            placeholder="e.g., 20% off on all items, Diwali special sale..."
            className="bg-background/50 min-h-20"
          />
        </div>

        <Button
          onClick={generatePoster}
          disabled={isGenerating || !businessName.trim()}
          className="w-full bg-gradient-to-r from-success to-primary"
        >
          {isGenerating ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Poster
            </>
          )}
        </Button>
      </div>

      <AnimatePresence>
        {posterUrl && !isGenerating && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-6 space-y-4"
          >
            <div className="relative rounded-xl overflow-hidden border border-border">
              <img
                src={posterUrl}
                alt="Generated poster"
                className="w-full h-auto"
              />
            </div>
            <Button
              onClick={downloadPoster}
              variant="outline"
              className="w-full"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Poster
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PosterGenerator;