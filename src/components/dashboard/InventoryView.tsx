import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Package, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

const InventoryView = () => {
  const { data: inventory, isLoading } = useQuery({
    queryKey: ["inventory"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inventory")
        .select("*")
        .order("name");
      
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <div className="text-center py-12">Loading inventory...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Inventory Management</h1>
        <p className="text-muted-foreground">Track and manage your product stock levels</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {inventory?.map((item, index) => {
          const isLowStock = item.quantity <= item.reorder_level;
          
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="glass-card p-6 rounded-2xl hover:scale-105 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl ${isLowStock ? 'bg-destructive/10' : 'bg-success/10'} flex items-center justify-center`}>
                  <Package className={`w-6 h-6 ${isLowStock ? 'text-destructive' : 'text-success'}`} />
                </div>
                {isLowStock && (
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-destructive/10">
                    <AlertCircle className="w-3 h-3 text-destructive" />
                    <span className="text-xs text-destructive font-medium">Low Stock</span>
                  </div>
                )}
              </div>

              <h3 className="text-lg font-semibold mb-2">{item.name}</h3>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Category:</span>
                  <span className="font-medium">{item.category}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Price:</span>
                  <span className="font-medium">₹{item.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Stock:</span>
                  <span className={`font-medium ${isLowStock ? 'text-destructive' : 'text-success'}`}>
                    {item.quantity} units
                  </span>
                </div>
              </div>

              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    isLowStock ? 'bg-destructive' : 'bg-success'
                  }`}
                  style={{
                    width: `${Math.min((item.quantity / item.reorder_level) * 50, 100)}%`,
                  }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default InventoryView;