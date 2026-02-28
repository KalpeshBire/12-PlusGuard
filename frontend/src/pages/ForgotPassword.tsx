import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FloatingInput } from "@/components/ui/FloatingInput";
import { Mail, ArrowLeft, Send, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import AuthLayout from "@/components/AuthLayout";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Mock API call
    setTimeout(() => {
      setSent(true);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <AuthLayout 
      title="Reset password" 
      subtitle={sent ? "Check your email for a reset link" : "Enter your email to receive a reset link"} 
      type="login"
    >
      <div className="space-y-6">
        {!sent ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <FloatingInput
              label="Email Address"
              type="email"
              icon={<Mail className="h-4 w-4" />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button 
              type="submit" 
              disabled={isLoading} 
              className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 group transition-all duration-300 active:scale-[0.98]"
            >
              {isLoading ? "Sending..." : (
                <span className="flex items-center gap-2">
                  Send Reset Link <Send className="h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </span>
              )}
            </Button>
          </form>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-8 text-center space-y-4 border-primary/20 bg-primary/5"
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold">Email Sent!</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We've sent a password reset link to <br />
                <span className="font-semibold text-foreground underline decoration-primary/30">{email}</span>
              </p>
            </div>
            <Button 
              variant="outline" 
              className="w-full mt-4 h-11 border-border/50"
              onClick={() => setSent(false)}
            >
              Resend Link
            </Button>
          </motion.div>
        )}

        <p className="text-center">
          <Link to="/login" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline underline-offset-4 transition-all">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
