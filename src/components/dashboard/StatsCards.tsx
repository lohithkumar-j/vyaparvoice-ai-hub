import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { TrendingUp, Package, Users, DollarSign } from "lucide-react";
import { motion } from "framer-motion";

const StatsCards = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: analytics } = useQuery({
    queryKey: ["analytics-today", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from("analytics")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
    enabled: !!user?.id,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const { data: inventoryCount } = useQuery({
    queryKey: ["inventory-count", user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;
      const { count } = await supabase
        .from("inventory")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);
      return count || 0;
    },
    enabled: !!user?.id,
  });

  const { data: customersCount } = useQuery({
    queryKey: ["customers-count", user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;
      const { count } = await supabase
        .from("customers")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);
      return count || 0;
    },
    enabled: !!user?.id,
  });

  // Real-time subscriptions
  useEffect(() => {
    if (!user?.id) return;

    const analyticsChannel = supabase
      .channel("analytics-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "analytics",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["analytics-today", user.id] });
        }
      )
      .subscribe();

    const inventoryChannel = supabase
      .channel("inventory-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "inventory",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["inventory-count", user.id] });
        }
      )
      .subscribe();

    const customersChannel = supabase
      .channel("customers-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "customers",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["customers-count", user.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(analyticsChannel);
      supabase.removeChannel(inventoryChannel);
      supabase.removeChannel(customersChannel);
    };
  }, [user?.id, queryClient]);

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
