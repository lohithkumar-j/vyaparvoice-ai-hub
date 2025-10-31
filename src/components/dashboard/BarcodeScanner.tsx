import { useState, useEffect, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface BarcodeScannerProps {
  onScan: (product: any) => void;
}

export function BarcodeScanner({ onScan }: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedCode, setScannedCode] = useState("");
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (isScanning) {
      const scanner = new Html5QrcodeScanner(
        "barcode-reader",
        { 
          fps: 10, 
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        false
      );

      scanner.render(
        async (decodedText) => {
          setScannedCode(decodedText);
          toast.success(`Scanned: ${decodedText}`);
          
          // Search for product in inventory
          const { data: product, error } = await supabase
            .from('inventory')
            .select('*')
            .eq('user_id', user?.id)
            .ilike('name', `%${decodedText}%`)
            .maybeSingle();

          if (error) {
            console.error('Error searching product:', error);
            toast.error("Error searching product");
            return;
          }

          if (product) {
            onScan(product);
            toast.success(`Found: ${product.name}`);
          } else {
            toast.info(`No product found with code: ${decodedText}`);
          }
          
          stopScanning();
        },
        (errorMessage) => {
          // Ignore errors during scanning
          console.debug(errorMessage);
        }
      );

      scannerRef.current = scanner;

      return () => {
        if (scannerRef.current) {
          scannerRef.current.clear().catch(console.error);
        }
      };
    }
  }, [isScanning, user?.id, onScan]);

  const startScanning = () => {
    setIsScanning(true);
  };

  const stopScanning = () => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch(console.error);
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  return (
    <Card className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Camera className="w-5 h-5" />
          Barcode Scanner
        </h2>
        {isScanning && (
          <Button variant="destructive" size="sm" onClick={stopScanning}>
            <X className="w-4 h-4 mr-2" />
            Stop Scanning
          </Button>
        )}
      </div>

      {!isScanning ? (
        <div className="text-center py-8">
          <Camera className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground mb-4">
            Scan product barcodes for quick lookup and billing
          </p>
          <Button onClick={startScanning}>
            <Camera className="w-4 h-4 mr-2" />
            Start Scanning
          </Button>
        </div>
      ) : (
        <div>
          <div id="barcode-reader" className="w-full"></div>
          {scannedCode && (
            <div className="mt-4 p-4 bg-primary/10 rounded-lg">
              <p className="text-sm font-medium">Last Scanned:</p>
              <p className="text-lg font-mono">{scannedCode}</p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
