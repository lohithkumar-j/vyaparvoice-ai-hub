import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { User, Phone, IndianRupee } from "lucide-react";
import { motion } from "framer-motion";

const CustomersView = () => {
  const { data: customers, isLoading } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .order("name");
      
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <div className="text-center py-12">Loading customers...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Customer Ledger</h1>
        <p className="text-muted-foreground">Manage customer credit and payment history</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {customers?.map((customer, index) => {
          const hasCredit = customer.balance > 0;
          const hasDebt = customer.balance < 0;
          
          return (
            <motion.div
              key={customer.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="glass-card p-6 rounded-2xl hover:scale-105 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                  <User className="w-6 h-6 text-secondary" />
                </div>
                {hasDebt && (
                  <div className="px-3 py-1 rounded-full bg-destructive/10">
                    <span className="text-xs text-destructive font-medium">Payment Due</span>
                  </div>
                )}
                {hasCredit && (
                  <div className="px-3 py-1 rounded-full bg-success/10">
                    <span className="text-xs text-success font-medium">Credit</span>
                  </div>
                )}
              </div>

              <h3 className="text-lg font-semibold mb-3">{customer.name}</h3>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  <span>{customer.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <IndianRupee className="w-4 h-4" />
                  <span className={`font-semibold ${
                    hasDebt ? 'text-destructive' : hasCredit ? 'text-success' : 'text-foreground'
                  }`}>
                    ₹{Math.abs(customer.balance).toFixed(2)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {hasDebt ? '(to collect)' : hasCredit ? '(advance)' : '(settled)'}
                  </span>
                </div>
              </div>

              {customer.last_transaction && (
                <div className="text-xs text-muted-foreground pt-3 border-t border-border/50">
                  Last transaction: {new Date(customer.last_transaction).toLocaleDateString('en-IN')}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default CustomersView;