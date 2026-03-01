import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FloatingInput } from "@/components/ui/FloatingInput";
import { Mail, Lock, User, ArrowRight, Loader2, Github } from "lucide-react";
import { motion } from "framer-motion";
import { useGoogleLogin } from "@react-oauth/google";

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

  const loginWithGoogle = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => toast({ title: "Google Auth Failed", variant: "destructive" }),
  });

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
          <Button 
            variant="outline" 
            className="h-11 flex-1 border-border/50 hover:bg-secondary/50 font-medium"
            onClick={() => loginWithGoogle()}
            disabled={isLoading}
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Google
          </Button>
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
