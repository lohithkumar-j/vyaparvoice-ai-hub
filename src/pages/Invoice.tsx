import { ArrowLeft, Sparkles, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { GSTInvoiceGenerator } from "@/components/dashboard/GSTInvoiceGenerator";
import { BarcodeScanner } from "@/components/dashboard/BarcodeScanner";
import { toast } from "sonner";

export default function Invoice() {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const handleProductScan = (product: any) => {
    toast.success(`Product scanned: ${product.name}`);
    // You can add logic here to add the product to invoice
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur-sm">
        <div className="flex items-center justify-between h-16 px-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-xl font-bold">VyaparAI</h1>
            </div>
          </div>
          <Button variant="ghost" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">GST Invoice & Billing</h1>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Barcode Scanner */}
            <BarcodeScanner onScan={handleProductScan} />

            {/* GST Invoice Generator */}
            <GSTInvoiceGenerator />
          </div>
        </div>
      </main>
    </div>
  );
}
