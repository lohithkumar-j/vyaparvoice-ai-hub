import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Package, AlertCircle, Plus, Edit, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import AddInventoryDialog from "./AddInventoryDialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const InventoryView = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [deleteItem, setDeleteItem] = useState<any>(null);

  const { data: inventory, isLoading } = useQuery({
    queryKey: ["inventory", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await supabase
        .from("inventory")
        .select("*")
        .eq("user_id", user.id)
        .order("name");
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Real-time subscription
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel("inventory-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "inventory",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["inventory", user.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient]);

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("inventory").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      toast({ title: "Product deleted", description: "Product removed from inventory" });
      setDeleteItem(null);
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  if (isLoading) {
    return <div className="text-center py-12">Loading inventory...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Inventory Management</h1>
          <p className="text-muted-foreground">Track and manage your product stock levels</p>
        </div>
        <Button onClick={() => setAddDialogOpen(true)} size="lg">
          <Plus className="w-5 h-5 mr-2" />
          Add Product
        </Button>
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

              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold">{item.name}</h3>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setEditItem(item);
                      setAddDialogOpen(true);
                    }}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setDeleteItem(item)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
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

      <AddInventoryDialog
        open={addDialogOpen}
        onOpenChange={(open) => {
          setAddDialogOpen(open);
          if (!open) setEditItem(null);
        }}
        editItem={editItem}
      />

      <AlertDialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteItem?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteItem && deleteMutation.mutate(deleteItem.id)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default InventoryView;
