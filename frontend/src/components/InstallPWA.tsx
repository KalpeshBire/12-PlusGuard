import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Download, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Types for the BeforeInstallPromptEvent
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function InstallPWA() {
  const [supportsPWA, setSupportsPWA] = useState(false);
  const [promptInstall, setPromptInstall] = useState<BeforeInstallPromptEvent | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setSupportsPWA(true);
      setPromptInstall(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // If app is already installed
    window.addEventListener('appinstalled', () => {
      setSupportsPWA(false);
      setPromptInstall(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const onClick = async () => {
    if (!promptInstall) {
      return;
    }
    await promptInstall.prompt();
    const { outcome } = await promptInstall.userChoice;
    
    if (outcome === 'accepted') {
      setSupportsPWA(false);
    }
  };

  const onDismiss = () => {
    setIsDismissed(true);
  };

  // Banner permanently disabled — return null always
  return null;

  /* Disabled install banner
  if (!supportsPWA || isDismissed) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        style={{ position: 'fixed', bottom: '1rem', left: '50%', transform: 'translateX(-50%)', zIndex: 9999, width: '100%', maxWidth: '420px', padding: '0 1rem', boxSizing: 'border-box' }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          padding: '12px 14px',
          borderRadius: '16px',
          background: 'hsl(var(--background) / 0.97)',
          backdropFilter: 'blur(12px)',
          border: '1px solid hsl(var(--border) / 0.5)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
          width: '100%',
          boxSizing: 'border-box',
          overflow: 'hidden',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1, minWidth: 0 }}>
            <h3 style={{ fontWeight: 600, fontSize: '13px', margin: 0, color: 'hsl(var(--foreground))' }}>
              Install PulseGuard
            </h3>
            <p style={{ fontSize: '11px', margin: 0, color: 'hsl(var(--muted-foreground))', lineHeight: 1.3 }}>
              Add to homescreen for offline use
            </p>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            <Button 
              size="sm" 
              onClick={onClick} 
              className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/30"
              style={{ height: '34px', padding: '0 16px', fontSize: '12px', flexShrink: 0 }}
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Install
            </Button>
            <Button 
              size="icon" 
              variant="ghost" 
              style={{ height: '32px', width: '32px', flexShrink: 0 }}
              className="rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary/50" 
              onClick={onDismiss}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
  */
}
