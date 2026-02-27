import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { User, Lock, Bell, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

export default function Settings() {
  const [userProfile, setUserProfile] = useState({ name: "", email: "" });

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUserProfile(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error("Failed to parse user profile from local storage");
    }
  }, []);

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your account and preferences</p>
      </div>

      {/* Profile */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="glass-card p-6 space-y-5">
        <div className="flex items-center gap-2 text-foreground">
          <User className="h-4.5 w-4.5 text-primary" />
          <h3 className="font-semibold">Profile Information</h3>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-muted-foreground">Full Name</Label>
            <Input value={userProfile.name} readOnly className="bg-secondary/50 border-border/50 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground">Email</Label>
            <Input value={userProfile.email} readOnly className="bg-secondary/50 border-border/50 text-muted-foreground" />
          </div>
        </div>
        <Button disabled className="bg-primary text-primary-foreground hover:bg-primary/90">Save Changes</Button>
      </motion.div>

      {/* Password */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="glass-card p-6 space-y-5">
        <div className="flex items-center gap-2 text-foreground">
          <Lock className="h-4.5 w-4.5 text-primary" />
          <h3 className="font-semibold">Change Password</h3>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-muted-foreground">Current Password</Label>
            <Input type="password" className="bg-secondary/50 border-border/50" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-muted-foreground">New Password</Label>
              <Input type="password" className="bg-secondary/50 border-border/50" />
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">Confirm Password</Label>
              <Input type="password" className="bg-secondary/50 border-border/50" />
            </div>
          </div>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Update Password</Button>
      </motion.div>

      {/* Notifications */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }} className="glass-card p-6 space-y-5">
        <div className="flex items-center gap-2 text-foreground">
          <Bell className="h-4.5 w-4.5 text-primary" />
          <h3 className="font-semibold">Notification Preferences</h3>
        </div>
        <div className="space-y-4">
          {[
            { label: "Email alerts when a monitor goes down", defaultChecked: true },
            { label: "Email alerts when a monitor recovers", defaultChecked: true },
            { label: "Weekly uptime summary report", defaultChecked: false },
            { label: "Monthly performance digest", defaultChecked: false },
          ].map((pref) => (
            <div key={pref.label} className="flex items-center justify-between rounded-lg bg-secondary/30 p-3">
              <span className="text-sm text-muted-foreground">{pref.label}</span>
              <Switch defaultChecked={pref.defaultChecked} />
            </div>
          ))}
        </div>
      </motion.div>

      {/* Danger Zone */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }} className="glass-card border-danger/20 p-6 space-y-4">
        <div className="flex items-center gap-2 text-danger">
          <Trash2 className="h-4.5 w-4.5" />
          <h3 className="font-semibold">Danger Zone</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Once you delete your account, there is no going back. Please be certain.
        </p>
        <Separator className="bg-danger/10" />
        <Button variant="destructive" className="bg-danger text-danger-foreground hover:bg-danger/90">
          Delete Account
        </Button>
      </motion.div>
    </div>
  );
}
