import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Download, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface InvoiceItem {
  name: string;
  quantity: number;
  price: number;
  gstRate: number;
}

export function GSTInvoiceGenerator() {
  const { user } = useAuth();
  const [customerName, setCustomerName] = useState("");
  const [customerGSTIN, setCustomerGSTIN] = useState("");
  const [items, setItems] = useState<InvoiceItem[]>([
    { name: "", quantity: 1, price: 0, gstRate: 18 }
  ]);

  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const addItem = () => {
    setItems([...items, { name: "", quantity: 1, price: 0, gstRate: 18 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const calculateItemTotal = (item: InvoiceItem) => {
    const subtotal = item.quantity * item.price;
    const gstAmount = (subtotal * item.gstRate) / 100;
    return subtotal + gstAmount;
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const totalGST = items.reduce((sum, item) => {
      const itemSubtotal = item.quantity * item.price;
      return sum + (itemSubtotal * item.gstRate) / 100;
    }, 0);
    const grandTotal = subtotal + totalGST;

    return { subtotal, totalGST, grandTotal };
  };

  const generateInvoice = () => {
    if (!customerName || items.some(item => !item.name || item.quantity <= 0 || item.price <= 0)) {
      toast.error("Please fill all required fields");
      return;
    }

    const { subtotal, totalGST, grandTotal } = calculateTotals();
    const invoiceDate = new Date().toLocaleDateString('en-IN');
    const invoiceNumber = `INV-${Date.now()}`;

    // Create invoice HTML
    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>GST Invoice - ${invoiceNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .company-name { font-size: 24px; font-weight: bold; color: #1a1a1a; }
          .invoice-details { margin: 20px 0; }
          .section { margin-bottom: 20px; }
          .section-title { font-weight: bold; margin-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #f8f9fa; font-weight: bold; }
          .text-right { text-align: right; }
          .totals { margin-top: 20px; }
          .grand-total { font-size: 18px; font-weight: bold; }
          .footer { margin-top: 50px; text-align: center; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">${profile?.shop_name || 'Your Business'}</div>
          <p>${profile?.phone || ''}</p>
        </div>

        <div class="invoice-details">
          <div style="display: flex; justify-content: space-between;">
            <div>
              <strong>Invoice Number:</strong> ${invoiceNumber}<br>
              <strong>Date:</strong> ${invoiceDate}
            </div>
            <div style="text-align: right;">
              <strong>Bill To:</strong><br>
              ${customerName}<br>
              ${customerGSTIN ? `GSTIN: ${customerGSTIN}` : ''}
            </div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th class="text-right">Qty</th>
              <th class="text-right">Price</th>
              <th class="text-right">GST %</th>
              <th class="text-right">GST Amt</th>
              <th class="text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            ${items.map(item => {
              const itemSubtotal = item.quantity * item.price;
              const gstAmount = (itemSubtotal * item.gstRate) / 100;
              const itemTotal = itemSubtotal + gstAmount;
              return `
                <tr>
                  <td>${item.name}</td>
                  <td class="text-right">${item.quantity}</td>
                  <td class="text-right">₹${item.price.toFixed(2)}</td>
                  <td class="text-right">${item.gstRate}%</td>
                  <td class="text-right">₹${gstAmount.toFixed(2)}</td>
                  <td class="text-right">₹${itemTotal.toFixed(2)}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>

        <div class="totals" style="margin-left: auto; width: 300px;">
          <table>
            <tr>
              <td><strong>Subtotal:</strong></td>
              <td class="text-right">₹${subtotal.toFixed(2)}</td>
            </tr>
            <tr>
              <td><strong>Total GST:</strong></td>
              <td class="text-right">₹${totalGST.toFixed(2)}</td>
            </tr>
            <tr class="grand-total">
              <td><strong>Grand Total:</strong></td>
              <td class="text-right">₹${grandTotal.toFixed(2)}</td>
            </tr>
          </table>
        </div>

        <div class="footer">
          <p>Thank you for your business!</p>
          <p style="font-size: 12px;">This is a computer generated invoice</p>
        </div>
      </body>
      </html>
    `;

    // Open in new window for printing
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(invoiceHTML);
      printWindow.document.close();
      toast.success("Invoice generated! You can print or save as PDF.");
    } else {
      toast.error("Please allow popups to generate invoice");
    }
  };

  const { subtotal, totalGST, grandTotal } = calculateTotals();

  return (
    <Card className="glass-card p-6">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <FileText className="w-5 h-5" />
        GST Invoice Generator
      </h2>

      <div className="space-y-4">
        {/* Customer Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="customerName">Customer Name *</Label>
            <Input
              id="customerName"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Enter customer name"
            />
          </div>
          <div>
            <Label htmlFor="customerGSTIN">Customer GSTIN (Optional)</Label>
            <Input
              id="customerGSTIN"
              value={customerGSTIN}
              onChange={(e) => setCustomerGSTIN(e.target.value)}
              placeholder="e.g., 29ABCDE1234F1Z5"
            />
          </div>
        </div>

        {/* Items */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label>Invoice Items</Label>
            <Button size="sm" variant="outline" onClick={addItem}>
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </div>

          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-4">
                  <Input
                    placeholder="Item name"
                    value={item.name}
                    onChange={(e) => updateItem(index, 'name', e.target.value)}
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    type="number"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                    min="1"
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Price"
                    value={item.price}
                    onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value) || 0)}
                    min="0"
                  />
                </div>
                <div className="col-span-2">
                  <Select
                    value={item.gstRate.toString()}
                    onValueChange={(value) => updateItem(index, 'gstRate', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">0% GST</SelectItem>
                      <SelectItem value="5">5% GST</SelectItem>
                      <SelectItem value="12">12% GST</SelectItem>
                      <SelectItem value="18">18% GST</SelectItem>
                      <SelectItem value="28">28% GST</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-1">
                  <p className="text-sm font-medium text-right">₹{calculateItemTotal(item).toFixed(2)}</p>
                </div>
                <div className="col-span-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(index)}
                    disabled={items.length === 1}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div className="border-t pt-4">
          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-medium">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total GST:</span>
                <span className="font-medium">₹{totalGST.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Grand Total:</span>
                <span>₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <Button onClick={generateInvoice} className="w-full" size="lg">
          <Download className="w-4 h-4 mr-2" />
          Generate Invoice
        </Button>
      </div>
    </Card>
  );
}
