import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { IndianRupee, Calendar, ArrowUp, ArrowDown } from "lucide-react";

interface CustomerDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: any;
}

const CustomerDetailDialog = ({ open, onOpenChange, customer }: CustomerDetailDialogProps) => {
  const queryClient = useQueryClient();
  const [paymentAmount, setPaymentAmount] = useState("");
  const [notes, setNotes] = useState("");

  const { data: transactions } = useQuery({
    queryKey: ["transactions", customer?.id],
    queryFn: async () => {
      if (!customer?.id) return [];
      const { data } = await supabase
        .from("transactions")
        .select("*")
        .eq("customer_id", customer.id)
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!customer?.id && open,
  });

  const recordPaymentMutation = useMutation({
    mutationFn: async ({ amount, type }: { amount: number; type: string }) => {
      const { error: transactionError } = await supabase.from("transactions").insert({
        customer_id: customer.id,
        user_id: customer.user_id,
        amount,
        type,
        notes,
      });
      if (transactionError) throw transactionError;

      const newBalance = type === "credit" 
        ? customer.balance + amount 
        : customer.balance - amount;

      const { error: customerError } = await supabase
        .from("customers")
        .update({ balance: newBalance, last_transaction: new Date().toISOString() })
        .eq("id", customer.id);
      if (customerError) throw customerError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["transactions", customer.id] });
      toast({ title: "Payment recorded", description: "Transaction added successfully" });
      setPaymentAmount("");
      setNotes("");
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handlePayment = (type: string) => {
    const amount = parseFloat(paymentAmount);
    if (!amount || amount <= 0) {
      toast({ title: "Invalid amount", description: "Please enter a valid amount", variant: "destructive" });
      return;
    }
    recordPaymentMutation.mutate({ amount, type });
  };

  if (!customer) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Customer Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="glass-card p-6 rounded-xl space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold">{customer.name}</h3>
                <p className="text-muted-foreground">{customer.phone}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Balance</p>
                <p className={`text-2xl font-bold ${
                  customer.balance < 0 ? 'text-destructive' : customer.balance > 0 ? 'text-success' : 'text-foreground'
                }`}>
                  ₹{Math.abs(customer.balance).toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {customer.balance < 0 ? '(to collect)' : customer.balance > 0 ? '(advance)' : '(settled)'}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold">Record Payment</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Amount (₹)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="Enter amount"
                />
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional notes"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => handlePayment("debit")}
                disabled={recordPaymentMutation.isPending}
                className="flex-1"
                variant="default"
              >
                <ArrowDown className="w-4 h-4 mr-2" />
                Customer Paid
              </Button>
              <Button
                onClick={() => handlePayment("credit")}
                disabled={recordPaymentMutation.isPending}
                className="flex-1"
                variant="secondary"
              >
                <ArrowUp className="w-4 h-4 mr-2" />
                Customer Bought
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold">Transaction History</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {transactions?.map((transaction) => (
                <div key={transaction.id} className="glass-card p-4 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      transaction.type === "debit" ? "bg-success/10" : "bg-destructive/10"
                    }`}>
                      {transaction.type === "debit" ? (
                        <ArrowDown className="w-5 h-5 text-success" />
                      ) : (
                        <ArrowUp className="w-5 h-5 text-destructive" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">
                        {transaction.type === "debit" ? "Payment Received" : "Credit Sale"}
                      </p>
                      {transaction.notes && (
                        <p className="text-sm text-muted-foreground">{transaction.notes}</p>
                      )}
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(transaction.created_at).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                  <div className={`text-lg font-bold ${
                    transaction.type === "debit" ? "text-success" : "text-destructive"
                  }`}>
                    {transaction.type === "debit" ? "-" : "+"}₹{transaction.amount.toFixed(2)}
                  </div>
                </div>
              ))}
              {(!transactions || transactions.length === 0) && (
                <p className="text-center text-muted-foreground py-8">No transactions yet</p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerDetailDialog;
