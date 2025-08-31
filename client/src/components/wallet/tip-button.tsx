import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useWalletTransactions } from "@/hooks/use-wallet-transactions";
import { Heart, Wallet } from "lucide-react";

interface TipButtonProps {
  creatorId: string;
  postId?: string;
  creatorName?: string;
  className?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "lg";
}

export function TipButton({ 
  creatorId, 
  postId, 
  creatorName = "creator",
  className = "",
  variant = "outline",
  size = "sm"
}: TipButtonProps) {
  const { wallet, tipMutation } = useWalletTransactions();
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const tipAmount = parseFloat(amount);
    if (isNaN(tipAmount) || tipAmount <= 0) {
      return;
    }

    tipMutation.mutate({
      creatorId,
      postId,
      amount: tipAmount,
      message: message.trim() || undefined
    }, {
      onSuccess: () => {
        setIsOpen(false);
        setAmount("");
        setMessage("");
      }
    });
  };

  if (!wallet.connected) {
    return (
      <Button 
        variant="ghost" 
        size={size}
        className={`text-muted-foreground ${className}`}
        disabled
        data-testid="tip-button-disabled"
      >
        <Wallet className="w-4 h-4 mr-1" />
        Connect Wallet to Tip
      </Button>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant={variant} 
          size={size}
          className={`hover-scale transition-smooth ${className}`}
          data-testid="tip-button"
        >
          <Heart className="w-4 h-4 mr-1" />
          Tip
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-strong border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            Send Tip to {creatorName}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="amount" className="text-foreground">Amount (SUI)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="bg-input/80 border-border"
              required
              data-testid="input-tip-amount"
            />
          </div>
          
          <div>
            <Label htmlFor="message" className="text-foreground">Message (optional)</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Send a message with your tip..."
              className="bg-input/80 border-border resize-none"
              rows={3}
              maxLength={280}
              data-testid="input-tip-message"
            />
            <div className="text-xs text-muted-foreground mt-1">
              {message.length}/280 characters
            </div>
          </div>

          <div className="text-sm text-muted-foreground bg-secondary/50 p-3 rounded-lg">
            <p className="font-medium mb-1">Transaction Details:</p>
            <p>• Amount: {amount || "0"} SUI</p>
            <p>• Network fees apply</p>
            <p>• Transaction will be recorded on the Sui blockchain</p>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1 glass border-border"
              data-testid="button-cancel-tip"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 gradient-primary text-primary-foreground"
              disabled={tipMutation.isPending || !amount || parseFloat(amount) <= 0}
              data-testid="button-confirm-tip"
            >
              {tipMutation.isPending ? "Processing..." : "Send Tip"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}