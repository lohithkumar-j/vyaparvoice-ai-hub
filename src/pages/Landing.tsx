import { motion } from "framer-motion";
import { Mic, TrendingUp, Package, Users, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import heroImage from "@/assets/hero-image.jpg";

const Landing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const stats = [
    { label: "Active Businesses", value: "50,000+", icon: Users },
    { label: "Products Tracked", value: "2M+", icon: Package },
    { label: "Revenue Growth", value: "145%", icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/20 to-background z-0" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Voice-Powered Business Management</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-success bg-clip-text text-transparent">
                VyaparAI
              </h1>
              
              <h2 className="text-3xl md:text-4xl font-semibold mb-6">
                Apni Dukaan, Apni <span className="text-primary">Voice</span>
              </h2>
              
              <p className="text-lg text-muted-foreground mb-8 max-w-xl">
                Manage your entire business with just your voice. Track inventory, 
                analyze sales, manage customers - all in Hindi and English.
              </p>
              
              <div className="flex flex-wrap gap-4">
                {user ? (
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-primary to-primary-glow hover:shadow-lg hover:shadow-primary/50 transition-all duration-300 text-lg px-8"
                    onClick={() => navigate("/dashboard")}
                  >
                    <Mic className="w-5 h-5 mr-2" />
                    Go to Dashboard
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                ) : (
                  <>
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-primary to-primary-glow hover:shadow-lg hover:shadow-primary/50 transition-all duration-300 text-lg px-8"
                      onClick={() => navigate("/signup")}
                    >
                      <Mic className="w-5 h-5 mr-2" />
                      Start Speaking
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                    
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-2 border-secondary text-secondary hover:bg-secondary/10 text-lg px-8"
                      onClick={() => navigate("/login")}
                    >
                      Login
                    </Button>
                  </>
                )}
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden glass-card glow-primary">
                <img
                  src={heroImage}
                  alt="VyaparAI Dashboard"
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-border/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center glass-card p-8 rounded-2xl hover:scale-105 transition-transform duration-300"
              >
                <stat.icon className="w-12 h-12 mx-auto mb-4 text-primary" />
                <div className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-success bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Everything Your Business Needs
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed for Indian small businesses
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Voice Commands",
                description: "Control everything with Hindi & English voice commands",
                icon: Mic,
                color: "primary",
              },
              {
                title: "Smart Inventory",
                description: "Track stock levels with automatic reorder alerts",
                icon: Package,
                color: "secondary",
              },
              {
                title: "Customer Ledger",
                description: "Manage credit, payments and customer relationships",
                icon: Users,
                color: "success",
              },
              {
                title: "Sales Analytics",
                description: "Real-time insights and revenue tracking",
                icon: TrendingUp,
                color: "primary",
              },
              {
                title: "Receipt Scanning",
                description: "Digitize bills instantly with AI",
                icon: Sparkles,
                color: "secondary",
              },
              {
                title: "Marketing Tools",
                description: "Create professional posters in seconds",
                icon: Sparkles,
                color: "success",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="glass-card p-6 rounded-2xl hover:scale-105 transition-all duration-300 group"
              >
                <div className={`w-16 h-16 rounded-xl bg-${feature.color}/10 flex items-center justify-center mb-4 group-hover:shadow-lg group-hover:shadow-${feature.color}/30 transition-shadow`}>
                  <feature.icon className={`w-8 h-8 text-${feature.color}`} />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 z-0" />
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="glass-card p-12 rounded-3xl text-center max-w-4xl mx-auto"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Transform Your Business?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of Indian businesses growing with VyaparAI
            </p>
            <Button
              size="lg"
              className="bg-gradient-to-r from-primary via-secondary to-success hover:shadow-xl hover:shadow-primary/50 transition-all duration-300 text-lg px-12"
              onClick={() => user ? navigate("/dashboard") : navigate("/signup")}
            >
              <Mic className="w-5 h-5 mr-2" />
              {user ? "Go to Dashboard" : "Get Started Free"}
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Landing;