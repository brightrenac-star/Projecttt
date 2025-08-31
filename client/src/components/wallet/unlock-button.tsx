import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useWalletTransactions } from "@/hooks/use-wallet-transactions";
import { Lock, Wallet, Unlock } from "lucide-react";

interface UnlockButtonProps {
  postId: string;
  price: number;
  postTitle?: string;
  className?: string;
  isUnlocked?: boolean;
  onUnlocked?: () => void;
}

export function UnlockButton({ 
  postId, 
  price,
  postTitle = "this content",
  className = "",
  isUnlocked = false,
  onUnlocked
}: UnlockButtonProps) {
  const { wallet, unlockPostMutation } = useWalletTransactions();
  const [isOpen, setIsOpen] = useState(false);

  const handleUnlock = () => {
    unlockPostMutation.mutate({
      postId,
      amount: price
    }, {
      onSuccess: () => {
        setIsOpen(false);
        onUnlocked?.();
      }
    });
  };

  if (isUnlocked) {
    return (
      <Button 
        variant="outline" 
        className={`border-green-500 text-green-500 cursor-default ${className}`}
        disabled
        data-testid="unlock-button-unlocked"
      >
        <Unlock className="w-4 h-4 mr-1" />
        Unlocked
      </Button>
    );
  }

  if (!wallet.connected) {
    return (
      <Button 
        variant="ghost" 
        className={`text-muted-foreground ${className}`}
        disabled
        data-testid="unlock-button-disabled"
      >
        <Wallet className="w-4 h-4 mr-1" />
        Connect Wallet to Unlock
      </Button>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline"
          className={`border-amber-500 text-amber-500 hover:bg-amber-500/10 hover-scale transition-smooth ${className}`}
          data-testid="unlock-button"
        >
          <Lock className="w-4 h-4 mr-1" />
          Unlock for ${price}
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-strong border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            Unlock Premium Content
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="text-center py-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-500/20 flex items-center justify-center">
              <Lock className="w-8 h-8 text-amber-500" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Unlock "{postTitle}"
            </h3>
            <p className="text-muted-foreground">
              Pay once to access this exclusive content forever.
            </p>
          </div>

          <div className="bg-secondary/50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Content Price:</span>
              <span className="font-medium text-foreground">${price} SUI</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Network Fee:</span>
              <span className="text-muted-foreground">~$0.01</span>
            </div>
            <hr className="border-border" />
            <div className="flex justify-between font-medium">
              <span className="text-foreground">Total:</span>
              <span className="text-foreground">~${price} SUI</span>
            </div>
          </div>

          <div className="text-xs text-muted-foreground bg-blue-500/10 p-3 rounded-lg">
            <p className="font-medium text-blue-400 mb-1">💡 One-time payment</p>
            <p>• Permanent access to this content</p>
            <p>• Transaction recorded on blockchain</p>
            <p>• No subscription required</p>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1 glass border-border"
              data-testid="button-cancel-unlock"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUnlock}
              className="flex-1 gradient-primary text-primary-foreground"
              disabled={unlockPostMutation.isPending}
              data-testid="button-confirm-unlock"
            >
              {unlockPostMutation.isPending ? "Unlocking..." : `Unlock for $${price}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}