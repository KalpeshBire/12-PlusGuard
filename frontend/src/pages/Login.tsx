import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FloatingInput } from "@/components/ui/FloatingInput";
import { Mail, Lock, ArrowRight, Loader2, Github } from "lucide-react";
import { motion } from "framer-motion";
import { GoogleLogin } from "@react-oauth/google";

import { authApi } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import AuthLayout from "@/components/AuthLayout";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const { toast } = useToast();

  const handleGoogleSuccess = async (codeResponse: any) => {
    setIsLoading(true);
    try {
      const res = await authApi.google(codeResponse) as any;
      localStorage.setItem("token", res.token);
      if (res.user) {
        localStorage.setItem("user", JSON.stringify(res.user));
      }
      window.location.href = "/dashboard";
    } catch (err: any) {
      toast({
        title: "Google Login Failed",
        description: err.message || "Could not authenticate with Google.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(false);
    
    try {
      const res = await authApi.login(email, password) as any;
      localStorage.setItem("token", res.token);
      if (res.user) {
        localStorage.setItem("user", JSON.stringify(res.user));
      }
      window.location.href = "/dashboard";
    } catch (err: any) {
      setError(true);
      toast({
        title: "Login Failed",
        description: err.message || "Invalid credentials. Please try again.",
        variant: "destructive",
      });
      setTimeout(() => setError(false), 500);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Welcome back" 
      subtitle="Monitor smarter. Stay online." 
      type="login"
    >
      <motion.div
        animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
        transition={{ duration: 0.4 }}
        className="space-y-6"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <FloatingInput
            label="Email Address"
            type="email"
            icon={<Mail className="h-4 w-4" />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="space-y-1">
            <FloatingInput
              label="Password"
              type="password"
              icon={<Lock className="h-4 w-4" />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div className="flex justify-end">
              <Link 
                to="/forgot-password" 
                className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={isLoading} 
            className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 group transition-all duration-300 active:scale-[0.98]"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                Sign In
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
            <span className="bg-background px-2 text-muted-foreground font-medium">Or continue with</span>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex-1 flex overflow-hidden rounded-md h-11 justify-center items-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast({ title: "Google Login Failed", variant: "destructive" })}
              theme="outline"
              size="large"
            />
          </div>
          <Button variant="outline" className="h-11 flex-1 border-border/50 hover:bg-secondary/50 font-medium" disabled={isLoading}>
            <Github className="mr-2 h-4 w-4" />
            GitHub
          </Button>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link to="/register" className="font-semibold text-primary hover:underline underline-offset-4">
            Create an account
          </Link>
        </p>
      </motion.div>
    </AuthLayout>
  );
}
