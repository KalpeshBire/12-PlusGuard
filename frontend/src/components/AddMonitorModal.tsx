import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Globe, Mail, Clock, Power, Settings2, Shield } from "lucide-react";

import { monitorsApi } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

interface AddMonitorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdded?: () => void;
}

export function AddMonitorModal({ open, onOpenChange, onAdded }: AddMonitorModalProps) {
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [interval, setInterval] = useState("5");
  const [enabled, setEnabled] = useState(true);
  const [email, setEmail] = useState("");
  const [httpMethod, setHttpMethod] = useState("GET");
  const [customHeaders, setCustomHeaders] = useState("");
  const [timeout, setTimeout] = useState("30");
  const [expectedStatusCode, setExpectedStatusCode] = useState("200");
  const [keywordCheck, setKeywordCheck] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    if (!url || !name) {
      toast({ title: "Validation Error", description: "Name and URL are required", variant: "destructive" });
      return;
    }
    
    setIsLoading(true);
    try {
      await monitorsApi.create({
        url,
        name,
        interval: Number(interval),
        enabled,
        alertEmail: email,
        httpMethod,
        customHeaders,
        timeout: Number(timeout),
        expectedStatusCode: Number(expectedStatusCode),
        keywordCheck
      });
      
      toast({ title: "Success", description: "Monitor created successfully!" });
      onOpenChange(false);
      
      // Reset form
      setUrl("");
      setName("");
      setInterval("5");
      setEnabled(true);
      setEmail("");
      setHttpMethod("GET");
      setCustomHeaders("");
      setTimeout("30");
      setExpectedStatusCode("200");
      setKeywordCheck("");
      
      if (onAdded) onAdded();
    } catch (error: any) {
      toast({ title: "Error Creating Monitor", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card border-border/50 sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-foreground">Add New Monitor</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-secondary/50">
            <TabsTrigger value="basic" className="gap-1.5 text-xs">
              <Globe className="h-3.5 w-3.5" /> Basic
            </TabsTrigger>
            <TabsTrigger value="advanced" className="gap-1.5 text-xs">
              <Settings2 className="h-3.5 w-3.5" /> Advanced
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-muted-foreground">
                <Settings2 className="h-3.5 w-3.5" /> Monitor Name
              </Label>
              <Input placeholder="E.g. Production API" value={name} onChange={(e) => setName(e.target.value)} className="bg-secondary/50 border-border/50 focus:border-primary/50" />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-muted-foreground">
                <Globe className="h-3.5 w-3.5" /> Website URL
              </Label>
              <Input placeholder="https://example.com" value={url} onChange={(e) => setUrl(e.target.value)} className="bg-secondary/50 border-border/50 focus:border-primary/50" />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-3.5 w-3.5" /> Check Interval
              </Label>
              <Select value={interval} onValueChange={setInterval}>
                <SelectTrigger className="bg-secondary/50 border-border/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">Every 3 minutes</SelectItem>
                  <SelectItem value="5">Every 5 minutes</SelectItem>
                  <SelectItem value="10">Every 10 minutes</SelectItem>
                  <SelectItem value="15">Every 15 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-3.5 w-3.5" /> Alert Email
              </Label>
              <Input type="email" placeholder="alerts@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-secondary/50 border-border/50 focus:border-primary/50" />
            </div>

            <div className="flex items-center justify-between rounded-lg bg-secondary/30 p-3">
              <Label className="flex items-center gap-2 text-muted-foreground">
                <Power className="h-3.5 w-3.5" /> Enable Monitor
              </Label>
              <Switch checked={enabled} onCheckedChange={setEnabled} />
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-muted-foreground text-xs">HTTP Method</Label>
                <Select value={httpMethod} onValueChange={setHttpMethod}>
                  <SelectTrigger className="bg-secondary/50 border-border/50"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GET">GET</SelectItem>
                    <SelectItem value="POST">POST</SelectItem>
                    <SelectItem value="HEAD">HEAD</SelectItem>
                    <SelectItem value="PUT">PUT</SelectItem>
                    <SelectItem value="DELETE">DELETE</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-muted-foreground text-xs">Timeout (seconds)</Label>
                <Select value={timeout} onValueChange={setTimeout}>
                  <SelectTrigger className="bg-secondary/50 border-border/50"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5s</SelectItem>
                    <SelectItem value="10">10s</SelectItem>
                    <SelectItem value="15">15s</SelectItem>
                    <SelectItem value="30">30s</SelectItem>
                    <SelectItem value="60">60s</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs">Expected Status Code</Label>
              <Input placeholder="200" value={expectedStatusCode} onChange={(e) => setExpectedStatusCode(e.target.value)} className="bg-secondary/50 border-border/50 focus:border-primary/50" />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-muted-foreground text-xs">
                <Shield className="h-3.5 w-3.5" /> Custom Headers (JSON)
              </Label>
              <Textarea
                placeholder={'{"Authorization": "Bearer token"}'}
                value={customHeaders}
                onChange={(e) => setCustomHeaders(e.target.value)}
                className="bg-secondary/50 border-border/50 focus:border-primary/50 font-mono text-xs min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs">Keyword Check</Label>
              <Input placeholder="Check if response contains..." value={keywordCheck} onChange={(e) => setKeywordCheck(e.target.value)} className="bg-secondary/50 border-border/50 focus:border-primary/50" />
              <p className="text-xs text-muted-foreground">Alert if this keyword is missing from the response body</p>
            </div>
          </TabsContent>
        </Tabs>

        <Button onClick={handleSave} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 mt-2">
          Save Monitor
        </Button>
      </DialogContent>
    </Dialog>
  );
}
