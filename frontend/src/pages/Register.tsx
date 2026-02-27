import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Activity, Mail, Lock, User, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

import { authApi } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast({ title: "Passwords match", description: "Your passwords do not match.", variant: "destructive" });
      return;
    }
    
    setIsLoading(true);
    try {
      const res = await authApi.register({ name, email, password }) as any;
      localStorage.setItem("token", res.token);
      if (res.user) {
        localStorage.setItem("user", JSON.stringify(res.user));
      }
      toast({ title: "Registration Successful", description: "Your account has been created." });
      window.location.href = "/dashboard";
    } catch (err: any) {
      toast({
        title: "Registration Failed",
        description: err.message || "Could not create account. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm"
      >
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary">
            <Activity className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Create account</h1>
          <p className="text-sm text-muted-foreground">Get started with PulseGuard</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card p-6 space-y-5">
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-muted-foreground"><User className="h-3.5 w-3.5" /> Full Name</Label>
            <Input placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} required className="bg-secondary/50 border-border/50 focus:border-primary/50" />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-muted-foreground"><Mail className="h-3.5 w-3.5" /> Email</Label>
            <Input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-secondary/50 border-border/50 focus:border-primary/50" />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-muted-foreground"><Lock className="h-3.5 w-3.5" /> Password</Label>
            <Input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required className="bg-secondary/50 border-border/50 focus:border-primary/50" />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-muted-foreground"><Lock className="h-3.5 w-3.5" /> Confirm Password</Label>
            <Input type="password" placeholder="••••••••" value={confirm} onChange={(e) => setConfirm(e.target.value)} required className="bg-secondary/50 border-border/50 focus:border-primary/50" />
          </div>
          <Button type="submit" disabled={isLoading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
            {isLoading ? "Creating Account..." : "Create Account"} <ArrowRight className="h-4 w-4" />
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-primary hover:text-primary/80 transition-colors">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
