import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, Package, Users, DollarSign } from "lucide-react";
import { motion } from "framer-motion";

const StatsCards = () => {
  const { data: analytics } = useQuery({
    queryKey: ["analytics-today"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("analytics")
        .select("*")
        .order("date", { ascending: false })
        .limit(1)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  const { data: inventoryCount } = useQuery({
    queryKey: ["inventory-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("inventory")
        .select("*", { count: "exact", head: true });
      
      if (error) throw error;
      return count || 0;
    },
  });

  const { data: customersCount } = useQuery({
    queryKey: ["customers-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("customers")
        .select("*", { count: "exact", head: true });
      
      if (error) throw error;
      return count || 0;
    },
  });

  const stats = [
    {
      label: "Today's Revenue",
      value: `₹${analytics?.revenue?.toLocaleString() || "0"}`,
      icon: DollarSign,
      color: "primary",
      trend: "+12.5%",
    },
    {
      label: "Total Products",
      value: inventoryCount || 0,
      icon: Package,
      color: "secondary",
      trend: "+5",
    },
    {
      label: "Active Customers",
      value: customersCount || 0,
      icon: Users,
      color: "success",
      trend: "+8",
    },
    {
      label: "Today's Profit",
      value: `₹${analytics?.profit?.toLocaleString() || "0"}`,
      icon: TrendingUp,
      color: "primary",
      trend: "+18.2%",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="glass-card p-6 rounded-2xl hover:scale-105 transition-all duration-300"
        >
          <div className="flex items-start justify-between mb-4">
            <div className={`w-12 h-12 rounded-xl bg-${stat.color}/10 flex items-center justify-center`}>
              <stat.icon className={`w-6 h-6 text-${stat.color}`} />
            </div>
            <span className="text-success text-sm font-medium">{stat.trend}</span>
          </div>
          <div className="text-3xl font-bold mb-1">{stat.value}</div>
          <div className="text-sm text-muted-foreground">{stat.label}</div>
        </motion.div>
      ))}
    </div>
  );
};

export default StatsCards;