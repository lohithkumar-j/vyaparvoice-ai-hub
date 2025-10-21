import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Sparkles, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const AIInsights = () => {
  const [insights, setInsights] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch business data for AI analysis
  const { data: analytics } = useQuery({
    queryKey: ["analytics-latest"],
    queryFn: async () => {
      const { data } = await supabase
        .from("analytics")
        .select("*")
        .order("date", { ascending: false })
        .limit(7);
      return data;
    },
  });

  const { data: inventory } = useQuery({
    queryKey: ["inventory-summary"],
    queryFn: async () => {
      const { data } = await supabase
        .from("inventory")
        .select("*");
      return data;
    },
  });

  const { data: customers } = useQuery({
    queryKey: ["customers-summary"],
    queryFn: async () => {
      const { data } = await supabase
        .from("customers")
        .select("*");
      return data;
    },
  });

  const generateInsights = async () => {
    setIsGenerating(true);
    
    try {
      // Prepare business data
      const businessData = {
        recentSales: analytics?.map(a => ({
          date: a.date,
          revenue: a.revenue,
          profit: a.profit,
        })),
        inventoryStats: {
          totalProducts: inventory?.length || 0,
          lowStockItems: inventory?.filter(i => i.quantity <= i.reorder_level).length || 0,
        },
        customerStats: {
          totalCustomers: customers?.length || 0,
          customersWithDebt: customers?.filter(c => c.balance < 0).length || 0,
          totalOutstanding: customers?.reduce((sum, c) => sum + (c.balance < 0 ? Math.abs(c.balance) : 0), 0) || 0,
        },
      };

      const { data, error } = await supabase.functions.invoke('generate-insights', {
        body: { businessData },
      });

      if (error) throw error;

      if (data?.error) {
        toast.error(data.error);
        return;
      }

      setInsights(data.insights);
      toast.success("AI insights generated!");
    } catch (error) {
      console.error('Error generating insights:', error);
      toast.error("Failed to generate insights. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="glass-card p-6 rounded-2xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-xl font-bold">AI Business Insights</h2>
        </div>
        <Button
          onClick={generateInsights}
          disabled={isGenerating}
          size="sm"
          className="bg-gradient-to-r from-primary to-secondary"
        >
          {isGenerating ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate
            </>
          )}
        </Button>
      </div>

      <AnimatePresence mode="wait">
        {!insights && !isGenerating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-8 text-muted-foreground"
          >
            <p>Click "Generate" to get AI-powered insights about your business</p>
          </motion.div>
        )}

        {isGenerating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-8"
          >
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Analyzing your business data...</p>
          </motion.div>
        )}

        {insights && !isGenerating && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="prose prose-invert max-w-none"
          >
            <div className="whitespace-pre-wrap text-sm leading-relaxed">
              {insights}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIInsights;