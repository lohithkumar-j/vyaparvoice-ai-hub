import { Search, Bell, User, Moon, Sun } from "lucide-react";
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
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const DashboardHeader = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");

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
          
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
          </Button>
          
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
