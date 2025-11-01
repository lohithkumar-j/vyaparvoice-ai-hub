import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Mail, Lock, User, Building, Phone } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import confetti from "canvas-confetti";

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    shopName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const getPasswordStrength = (password: string) => {
    if (password.length < 6) return { strength: 0, label: "Weak", color: "bg-destructive" };
    if (password.length < 10) return { strength: 50, label: "Medium", color: "bg-warning" };
    return { strength: 100, label: "Strong", color: "bg-success" };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!agreeToTerms) {
      toast.error("Please agree to Terms & Conditions");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            name: formData.name,
            shop_name: formData.shopName,
            phone: formData.phone,
          },
        },
      });

      if (error) throw error;

      if (data.session) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
        toast.success("Account created successfully!");
        setTimeout(() => navigate("/dashboard"), 1000);
      } else {
        toast.success("Please check your email to confirm your account");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to create account");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || "Failed to sign up with Google");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-secondary to-success flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
      >
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold mb-2 text-white">
            VyaparAI
          </h1>
          <p className="text-white/80">Create your account to get started</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Full Name *</label>
            <div className="relative">
              <User className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Your Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Shop Name *</label>
            <div className="relative">
              <Building className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Your Shop Name"
                value={formData.shopName}
                onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Email *</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
              <Input
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Phone</label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
              <Input
                type="tel"
                placeholder="+91 XXXXX XXXXX"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Password *</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Min. 8 characters"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="pl-10 pr-10"
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {formData.password && (
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span>Password Strength</span>
                  <span className={passwordStrength.strength === 100 ? "text-success" : "text-muted-foreground"}>
                    {passwordStrength.label}
                  </span>
                </div>
                <div className="h-1 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                    style={{ width: `${passwordStrength.strength}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Confirm Password *</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
              <Input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Re-enter password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="pl-10 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox
              id="terms"
              checked={agreeToTerms}
              onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
            />
            <label htmlFor="terms" className="text-sm cursor-pointer leading-tight">
              I agree to the{" "}
              <Link to="/terms" className="text-primary hover:underline">
                Terms & Conditions
              </Link>
            </label>
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-primary to-secondary text-white"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              "Create Account"
            )}
          </Button>
        </form>

        <div className="my-6 flex items-center">
          <div className="flex-1 border-t border-border"></div>
          <span className="px-4 text-sm text-muted-foreground">OR</span>
          <div className="flex-1 border-t border-border"></div>
        </div>

        <Button onClick={handleGoogleSignup} variant="outline" className="w-full">
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Sign up with Google
        </Button>

        <p className="text-center mt-6 text-sm text-muted-foreground">
          Already have account?{" "}
          <Link to="/login" className="text-primary hover:underline font-medium">
            Login
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Signup;
