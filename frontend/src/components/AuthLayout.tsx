import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Activity, Shield, Zap, Globe, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
  type: "login" | "register";
}

export default function AuthLayout({ children, title, subtitle, type }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen bg-background font-sans">
      {/* Left Side: Branding & Features (Hidden on mobile) */}
      <div className="premium-bg sticky top-0 hidden w-1/2 flex-col justify-between p-12 lg:flex">
        <div className="grid-pattern" />
        <div className="floating-glow top-[-10%] left-[-10%]" />
        <div className="floating-glow bottom-[-10%] right-[-10%] bg-accent/20" />
        
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary shadow-[0_0_20px_rgba(16,185,129,0.3)] group-hover:scale-105 transition-transform">
              <Activity className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">PulseGuard</span>
          </Link>
        </div>

        <div className="relative z-10 max-w-lg">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="text-5xl font-extrabold leading-tight tracking-tight text-white mb-6">
              Monitor smarter.<br />
              <span className="gradient-text">Stay online.</span>
            </h2>
            <p className="text-xl text-muted-foreground/80 mb-12">
              The premium uptime monitoring solution for modern developers and teams.
            </p>

            <div className="space-y-6">
              {[
                { icon: Shield, text: "Enterprise-grade encryption" },
                { icon: Zap, text: "Real-time incident response" },
                { icon: Globe, text: "Global check nodes" },
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 + i * 0.1 }}
                  className="flex items-center gap-4 text-white/90"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="font-medium">{feature.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-6 text-sm text-muted-foreground/60 font-medium">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              99.9% Uptime
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              Instant Alerts
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Auth Form */}
      <div className="flex w-full flex-col justify-center p-8 lg:w-1/2 lg:p-12 relative overflow-hidden">
        {/* Decorative elements for mobile */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent lg:hidden" />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto w-full max-w-sm space-y-8"
        >
          <div className="lg:hidden flex flex-col items-center gap-3 mb-8">
             <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary">
              <Activity className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>

          <div className="space-y-2 text-center lg:text-left">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
            <p className="text-muted-foreground">{subtitle}</p>
          </div>

          {children}

          <div className="mt-8 pt-8 border-t border-border/50 text-center text-sm text-muted-foreground">
            <p className="flex items-center justify-center gap-2">
              <Shield className="h-3.5 w-3.5 text-primary" />
              Secure, encrypted authentication
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
