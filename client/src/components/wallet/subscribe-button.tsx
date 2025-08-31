import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useWalletTransactions } from "@/hooks/use-wallet-transactions";
import { useQuery } from "@tanstack/react-query";
import { UserPlus, Wallet, Star, Crown, Gem } from "lucide-react";

interface SubscribeButtonProps {
  creatorId: string;
  creatorName?: string;
  className?: string;
  isSubscribed?: boolean;
  onSubscribed?: () => void;
}

interface SubscriptionTier {
  name: string;
  price: number;
  description: string;
  benefits: string[];
}

export function SubscribeButton({ 
  creatorId, 
  creatorName = "creator",
  className = "",
  isSubscribed = false,
  onSubscribed
}: SubscribeButtonProps) {
  const { wallet, subscribeMutation } = useWalletTransactions();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<string>("");

  // Get subscription tiers
  const { data: tiers = [] } = useQuery<SubscriptionTier[]>({
    queryKey: ["/api/creators", creatorId, "subscription-tiers"],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const tier = tiers.find(t => t.name === selectedTier);
    if (!tier) return;

    subscribeMutation.mutate({
      creatorId,
      tier: tier.name,
      amount: tier.price,
      duration: 30 // 30 days default
    }, {
      onSuccess: () => {
        setIsOpen(false);
        setSelectedTier("");
        onSubscribed?.();
      }
    });
  };

  const getTierIcon = (tierName: string) => {
    switch (tierName.toLowerCase()) {
      case 'basic': return <Star className="w-4 h-4" />;
      case 'premium': return <Crown className="w-4 h-4" />;
      case 'vip': return <Gem className="w-4 h-4" />;
      default: return <UserPlus className="w-4 h-4" />;
    }
  };

  const getTierColor = (tierName: string) => {
    switch (tierName.toLowerCase()) {
      case 'basic': return 'bg-blue-500';
      case 'premium': return 'bg-purple-500';
      case 'vip': return 'bg-gold-500';
      default: return 'bg-primary';
    }
  };

  if (isSubscribed) {
    return (
      <Button 
        variant="outline" 
        className={`border-green-500 text-green-500 cursor-default ${className}`}
        disabled
        data-testid="subscribe-button-subscribed"
      >
        <UserPlus className="w-4 h-4 mr-1" />
        Subscribed
      </Button>
    );
  }

  if (!wallet.connected) {
    return (
      <Button 
        variant="ghost" 
        className={`text-muted-foreground ${className}`}
        disabled
        data-testid="subscribe-button-disabled"
      >
        <Wallet className="w-4 h-4 mr-1" />
        Connect Wallet to Subscribe
      </Button>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          className={`gradient-primary text-primary-foreground hover-scale transition-smooth ${className}`}
          data-testid="subscribe-button"
        >
          <UserPlus className="w-4 h-4 mr-1" />
          Subscribe
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-strong border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            Subscribe to {creatorName}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-foreground mb-3 block">Choose your subscription tier:</Label>
            <div className="space-y-3">
              {tiers.map((tier) => (
                <div
                  key={tier.name}
                  onClick={() => setSelectedTier(tier.name)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedTier === tier.name
                      ? 'border-primary bg-primary/10'
                      : 'border-border glass hover:border-primary/50'
                  }`}
                  data-testid={`tier-option-${tier.name.toLowerCase()}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getTierIcon(tier.name)}
                      <h3 className="font-semibold text-foreground">{tier.name}</h3>
                      <Badge className={`${getTierColor(tier.name)} text-white`}>
                        ${tier.price}/month
                      </Badge>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      selectedTier === tier.name
                        ? 'bg-primary border-primary'
                        : 'border-border'
                    }`} />
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{tier.description}</p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {tier.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-center">
                        <span className="w-1 h-1 bg-primary rounded-full mr-2" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {selectedTier && (
            <div className="text-sm text-muted-foreground bg-secondary/50 p-3 rounded-lg">
              <p className="font-medium mb-1">Transaction Details:</p>
              <p>• Selected: {selectedTier} tier</p>
              <p>• Price: ${tiers.find(t => t.name === selectedTier)?.price}/month</p>
              <p>• Duration: 30 days</p>
              <p>• Network fees apply</p>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1 glass border-border"
              data-testid="button-cancel-subscription"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 gradient-primary text-primary-foreground"
              disabled={subscribeMutation.isPending || !selectedTier}
              data-testid="button-confirm-subscription"
            >
              {subscribeMutation.isPending ? "Processing..." : "Subscribe"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}