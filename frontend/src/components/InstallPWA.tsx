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

  if (!supportsPWA || isDismissed) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm"
      >
        <div className="bg-background/95 backdrop-blur-md border border-border/50 shadow-2xl rounded-2xl p-4 flex items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h3 className="font-semibold text-sm">Install PulseGuard</h3>
            <p className="text-xs text-muted-foreground whitespace-nowrap">Add to homescreen for offline use</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={onClick} className="rounded-full shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90">
              <Download className="w-4 h-4 mr-1.5" />
              Install
            </Button>
            <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground" onClick={onDismiss}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
