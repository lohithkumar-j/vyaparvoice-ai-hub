import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

interface AddInventoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editItem?: any;
}

const AddInventoryDialog = ({ open, onOpenChange, editItem }: AddInventoryDialogProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: editItem?.name || "",
    category: editItem?.category || "",
    quantity: editItem?.quantity || 0,
    price: editItem?.price || 0,
    reorder_level: editItem?.reorder_level || 10,
  });

  const addMutation = useMutation({
    mutationFn: async (data: any) => {
      if (editItem) {
        const { error } = await supabase
          .from("inventory")
          .update(data)
          .eq("id", editItem.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("inventory")
          .insert({ ...data, user_id: user?.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      toast({
        title: editItem ? "Product updated" : "Product added",
        description: editItem ? "Product has been updated successfully" : "New product added to inventory",
      });
      onOpenChange(false);
      setFormData({ name: "", category: "", quantity: 0, price: 0, reorder_level: 10 });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{editItem ? "Edit Product" : "Add New Product"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Product Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Groceries">Groceries</SelectItem>
                <SelectItem value="Snacks">Snacks</SelectItem>
                <SelectItem value="Beverages">Beverages</SelectItem>
                <SelectItem value="Personal Care">Personal Care</SelectItem>
                <SelectItem value="Household">Household</SelectItem>
                <SelectItem value="Stationery">Stationery</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price (₹)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="reorder_level">Reorder Level</Label>
            <Input
              id="reorder_level"
              type="number"
              value={formData.reorder_level}
              onChange={(e) => setFormData({ ...formData, reorder_level: parseInt(e.target.value) })}
              required
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={addMutation.isPending}>
              {addMutation.isPending ? "Saving..." : editItem ? "Update" : "Add Product"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddInventoryDialog;
