import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Upload, Camera, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const ReceiptScanner = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState<any>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Scan receipt
    await scanReceipt(file);
  };

  const scanReceipt = async (file: File) => {
    setIsScanning(true);
    setScannedData(null);

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Image = e.target?.result as string;

        const { data, error } = await supabase.functions.invoke('scan-receipt', {
          body: { image: base64Image },
        });

        if (error) throw error;

        if (data?.error) {
          toast.error(data.error);
          return;
        }

        setScannedData(data.data);
        toast.success("Receipt scanned successfully!");
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error scanning receipt:', error);
      toast.error("Failed to scan receipt. Please try again.");
    } finally {
      setIsScanning(false);
    }
  };

  const clearScan = () => {
    setPreviewImage(null);
    setScannedData(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="glass-card p-6 rounded-2xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
            <Camera className="w-5 h-5 text-secondary" />
          </div>
          <h2 className="text-xl font-bold">Receipt Scanner</h2>
        </div>
        {previewImage && (
          <Button
            onClick={clearScan}
            variant="ghost"
            size="sm"
          >
            <X className="w-4 h-4 mr-2" />
            Clear
          </Button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {!previewImage ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="border-2 border-dashed border-border rounded-xl p-8 text-center"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id="receipt-upload"
            />
            <label
              htmlFor="receipt-upload"
              className="cursor-pointer flex flex-col items-center gap-4"
            >
              <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center">
                <Upload className="w-8 h-8 text-secondary" />
              </div>
              <div>
                <p className="font-medium mb-1">Upload Receipt Image</p>
                <p className="text-sm text-muted-foreground">
                  Click to select or drag and drop
                </p>
              </div>
            </label>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <div className="relative rounded-xl overflow-hidden">
              <img
                src={previewImage}
                alt="Receipt preview"
                className="w-full h-auto max-h-64 object-contain bg-muted"
              />
              {isScanning && (
                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-sm">Scanning receipt...</p>
                  </div>
                </div>
              )}
            </div>

            {scannedData && !isScanning && (
              <div className="bg-muted/50 rounded-xl p-4 space-y-3">
                <h3 className="font-semibold text-sm text-muted-foreground mb-2">Extracted Data:</h3>
                
                {scannedData.items && (
                  <div className="space-y-2">
                    {scannedData.items.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{item.name} x{item.quantity}</span>
                        <span className="font-medium">₹{item.price}</span>
                      </div>
                    ))}
                  </div>
                )}

                {scannedData.total && (
                  <div className="pt-2 border-t border-border flex justify-between font-semibold">
                    <span>Total</span>
                    <span>₹{scannedData.total}</span>
                  </div>
                )}

                {scannedData.date && (
                  <div className="text-xs text-muted-foreground">
                    Date: {scannedData.date}
                  </div>
                )}

                {scannedData.rawText && (
                  <div className="text-xs text-muted-foreground whitespace-pre-wrap">
                    {scannedData.rawText}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReceiptScanner;