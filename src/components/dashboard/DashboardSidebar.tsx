import { motion } from "framer-motion";
import { Home, Package, TrendingUp, Users, Sparkles, FileText, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

interface DashboardSidebarProps {
  activeView: string;
  setActiveView: (view: 'overview' | 'inventory' | 'analytics' | 'customers') => void;
  onClose: () => void;
}

const DashboardSidebar = ({ activeView, setActiveView, onClose }: DashboardSidebarProps) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'customers', label: 'Customers', icon: Users },
  ];

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <motion.aside
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      exit={{ x: -300 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed left-0 top-0 h-screen w-64 bg-sidebar border-r border-sidebar-border z-40 flex flex-col"
    >
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center glow-primary">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold">VyaparAI</h2>
            <p className="text-xs text-muted-foreground">Voice Business</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setActiveView(item.id as any);
              onClose();
            }}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
              activeView === item.id
                ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-lg"
                : "text-sidebar-foreground hover:bg-sidebar-accent/50"
            )}
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border space-y-2">
        <button 
          onClick={() => navigate("/reports")}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent/50 transition-all duration-200"
        >
          <FileText className="w-5 h-5" />
          <span className="font-medium">Reports</span>
        </button>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-destructive hover:bg-destructive/10 transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </motion.aside>
  );
};

export default DashboardSidebar;