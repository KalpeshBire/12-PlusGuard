import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FloatingInput } from "@/components/ui/FloatingInput";
import { Mail, Lock, User, ArrowRight, Loader2, Github } from "lucide-react";
import { motion } from "framer-motion";
import { GoogleLogin } from "@react-oauth/google";

import { authApi } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import AuthLayout from "@/components/AuthLayout";
import PasswordStrength from "@/components/PasswordStrength";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const [strength, setStrength] = useState<"weak" | "medium" | "strong" | "">("");
  
  const { toast } = useToast();

  useEffect(() => {
    if (!password) {
      setStrength("");
      return;
    }

    if (password.length < 6) {
      setStrength("weak");
    } else if (password.length < 10) {
      setStrength("medium");
    } else {
      const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
      const hasNumber = /\d/.test(password);
      if (hasSpecial && hasNumber) {
        setStrength("strong");
      } else {
        setStrength("medium");
      }
    }
  }, [password]);

  const handleGoogleSuccess = async (codeResponse: any) => {
    setIsLoading(true);
    try {
      const res = await authApi.google(codeResponse) as any;
      localStorage.setItem("token", res.token);
      if (res.user) {
        localStorage.setItem("user", JSON.stringify(res.user));
      }
      toast({ 
        title: "Account Created", 
        description: "Welcome to PulseGuard! Redirecting..." 
      });
      window.location.href = "/dashboard";
    } catch (err: any) {
      toast({
        title: "Google Auth Failed",
        description: err.message || "Could not authenticate with Google.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(false);

    if (password !== confirm) {
      setError(true);
      toast({ 
        title: "Passwords mismatch", 
        description: "Your passwords do not match.", 
        variant: "destructive" 
      });
      setTimeout(() => setError(false), 500);
      return;
    }
    
    setIsLoading(true);
    try {
      const res = await authApi.register({ name, email, password }) as any;
      localStorage.setItem("token", res.token);
      if (res.user) {
        localStorage.setItem("user", JSON.stringify(res.user));
      }
      toast({ 
        title: "Account Created", 
        description: "Welcome to PulseGuard! Redirecting to dashboard..." 
      });
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1000);
    } catch (err: any) {
      setError(true);
      toast({
        title: "Registration Failed",
        description: err.message || "Could not create account. Please try again later.",
        variant: "destructive",
      });
      setTimeout(() => setError(false), 500);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Create account" 
      subtitle="Start monitoring in seconds." 
      type="register"
    >
      <motion.div
        animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
        transition={{ duration: 0.4 }}
        className="space-y-6"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <FloatingInput
            label="Full Name"
            icon={<User className="h-4 w-4" />}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <FloatingInput
            label="Email Address"
            type="email"
            icon={<Mail className="h-4 w-4" />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="space-y-3">
            <FloatingInput
              label="Password"
              type="password"
              icon={<Lock className="h-4 w-4" />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {password && <PasswordStrength strength={strength} />}
          </div>

          <FloatingInput
            label="Confirm Password"
            type="password"
            icon={<Lock className="h-4 w-4" />}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />

          <Button 
            type="submit" 
            disabled={isLoading} 
            className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 group transition-all duration-300 active:scale-[0.98] mt-2"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                Create Account
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border/50" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground font-medium">Or join with</span>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex-1 flex overflow-hidden rounded-md h-11 justify-center items-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast({ title: "Google Auth Failed", variant: "destructive" })}
              theme="outline"
              size="large"
            />
          </div>
          <Button variant="outline" className="h-11 flex-1 border-border/50 hover:bg-secondary/50 font-medium" disabled={isLoading}>
            <Github className="mr-2 h-4 w-4" />
            GitHub
          </Button>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-primary hover:underline underline-offset-4">
            Sign in
          </Link>
        </div>
      </motion.div>
    </AuthLayout>
  );
}
