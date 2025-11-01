import { Search, Bell, User, Moon, Sun, Package, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useTheme } from "@/hooks/useTheme";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";

const DashboardHeader = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationOpen, setNotificationOpen] = useState(false);

  const notifications = [
    {
      id: 1,
      type: "success",
      icon: CheckCircle,
      title: "Payment Received",
      description: "₹5,000 received from Rajesh Kumar",
      time: "5 minutes ago",
    },
    {
      id: 2,
      type: "warning",
      icon: AlertCircle,
      title: "Low Stock Alert",
      description: "Rice - 25kg is running low (5 items left)",
      time: "30 minutes ago",
    },
    {
      id: 3,
      type: "info",
      icon: Package,
      title: "New Order Placed",
      description: "Priya Sharma ordered Cooking Oil - 1L",
      time: "1 hour ago",
    },
    {
      id: 4,
      type: "success",
      icon: TrendingUp,
      title: "Daily Target Achieved",
      description: "You've reached 120% of your daily sales target!",
      time: "2 hours ago",
    },
    {
      id: 5,
      type: "info",
      icon: Package,
      title: "Inventory Updated",
      description: "5 new products added to inventory",
      time: "3 hours ago",
    },
  ];

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user?.id,
  });

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.toLowerCase().trim();
    
    if (query.includes("receipt") || query.includes("scanner")) {
      navigate("/dashboard");
      setTimeout(() => {
        document.querySelector('[data-section="receipt-scanner"]')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else if (query.includes("poster") || query.includes("generator")) {
      navigate("/dashboard");
      setTimeout(() => {
        document.querySelector('[data-section="poster-generator"]')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else if (query.includes("inventory") || query.includes("product")) {
      navigate("/dashboard");
      // Trigger inventory view
      window.dispatchEvent(new CustomEvent('navigate-to-view', { detail: 'inventory' }));
    } else if (query.includes("customer") || query.includes("ledger")) {
      navigate("/dashboard");
      window.dispatchEvent(new CustomEvent('navigate-to-view', { detail: 'customers' }));
    } else if (query.includes("analytics") || query.includes("sales")) {
      navigate("/dashboard");
      window.dispatchEvent(new CustomEvent('navigate-to-view', { detail: 'analytics' }));
    } else if (query.includes("expense")) {
      navigate("/expenses");
    } else if (query.includes("invoice") || query.includes("billing")) {
      navigate("/invoice");
    }
    
    setSearchQuery("");
  };

  return (
    <header className="sticky top-0 z-20 border-b border-border/50 glass-card backdrop-blur-xl">
      <div className="flex items-center justify-between p-4 md:p-6">
        <div className="flex-1 max-w-md">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search products, customers, sections..."
              className="pl-10 bg-background/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>

        <div className="flex items-center gap-2 ml-4">
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </Button>
          
          <Popover open={notificationOpen} onOpenChange={setNotificationOpen}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <div className="flex items-center justify-between px-4 py-3 border-b">
                <h3 className="font-semibold">Notifications</h3>
                <span className="text-xs text-muted-foreground">{notifications.length} new</span>
              </div>
              <ScrollArea className="h-[400px]">
                <div className="space-y-1 p-2">
                  {notifications.map((notification) => {
                    const Icon = notification.icon;
                    return (
                      <div
                        key={notification.id}
                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent transition-colors cursor-pointer"
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          notification.type === "success" ? "bg-green-500/10 text-green-500" :
                          notification.type === "warning" ? "bg-yellow-500/10 text-yellow-500" :
                          "bg-blue-500/10 text-blue-500"
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium mb-1">{notification.title}</p>
                          <p className="text-xs text-muted-foreground mb-1">{notification.description}</p>
                          <p className="text-xs text-muted-foreground/70">{notification.time}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </PopoverContent>
          </Popover>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <User className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{profile?.name || "User"}</p>
                  <p className="text-xs text-muted-foreground">{profile?.shop_name || "Shop"}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
