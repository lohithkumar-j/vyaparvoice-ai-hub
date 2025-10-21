import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatsCards from "@/components/dashboard/StatsCards";
import VoiceCommandButton from "@/components/dashboard/VoiceCommandButton";
import RecentActivities from "@/components/dashboard/RecentActivities";
import InventoryView from "@/components/dashboard/InventoryView";
import AnalyticsView from "@/components/dashboard/AnalyticsView";
import CustomersView from "@/components/dashboard/CustomersView";

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState<'overview' | 'inventory' | 'analytics' | 'customers'>('overview');

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg glass-card"
      >
        {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <AnimatePresence>
        {(sidebarOpen || window.innerWidth >= 1024) && (
          <DashboardSidebar
            activeView={activeView}
            setActiveView={setActiveView}
            onClose={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="lg:ml-64 min-h-screen">
        <DashboardHeader />
        
        <main className="p-4 md:p-8">
          <AnimatePresence mode="wait">
            {activeView === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold mb-2">Dashboard</h1>
                  <p className="text-muted-foreground">Welcome back! Here's your business overview.</p>
                </div>

                <StatsCards />
                
                <div className="flex justify-center my-12">
                  <VoiceCommandButton />
                </div>

                <RecentActivities />
              </motion.div>
            )}

            {activeView === 'inventory' && (
              <motion.div
                key="inventory"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <InventoryView />
              </motion.div>
            )}

            {activeView === 'analytics' && (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <AnalyticsView />
              </motion.div>
            )}

            {activeView === 'customers' && (
              <motion.div
                key="customers"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <CustomersView />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;