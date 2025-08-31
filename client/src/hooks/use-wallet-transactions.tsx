import { useWallet } from "@suiet/wallet-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export interface TipTransactionParams {
  creatorId: string;
  postId?: string;
  amount: number;
  message?: string;
}

export interface SubscriptionTransactionParams {
  creatorId: string;
  tier?: string;
  amount: number;
  duration?: number; // days
}

export interface UnlockTransactionParams {
  postId: string;
  amount: number;
}

export function useWalletTransactions() {
  const wallet = useWallet();
  const { toast } = useToast();

  // Verify wallet connection
  const verifyWalletMutation = useMutation({
    mutationFn: async ({ address, signature, nonce }: { address: string; signature: string; nonce: string }) => {
      const response = await apiRequest("POST", "/api/wallet/verify", {
        address,
        signature,
        nonce
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Wallet verified",
        description: "Your wallet has been successfully linked to your account."
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Verification failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Get nonce for wallet verification
  const getNonceMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("GET", "/api/wallet/nonce");
      return response.json();
    }
  });

  // Link wallet to account
  const linkWallet = async () => {
    if (!wallet.connected || !wallet.address) {
      throw new Error("Wallet not connected");
    }

    try {
      // Get nonce from backend
      const { nonce } = await getNonceMutation.mutateAsync();
      
      // Create a simple transaction to sign for verification
      const tx = new Transaction();
      tx.setGasBudget(1000000); // Minimal gas for verification
      
      // Sign the transaction (this proves ownership of the wallet)
      const result = await wallet.signAndExecuteTransaction({ transaction: tx });
      
      // Use transaction digest as signature proof
      await verifyWalletMutation.mutateAsync({
        address: wallet.address,
        signature: result.digest,
        nonce
      });
    } catch (error) {
      console.error("Wallet linking failed:", error);
      throw error;
    }
  };

  // Tip transaction
  const tipMutation = useMutation({
    mutationFn: async (params: TipTransactionParams) => {
      if (!wallet.connected || !wallet.address) {
        throw new Error("Connect wallet first");
      }

      // Create the tip transaction
      const tx = new Transaction();
      tx.setGasBudget(10_000_000); // Adjust based on network

      // In a real implementation, you would call a Move contract here
      // For now, we'll simulate by creating a minimal transaction
      const result = await wallet.signAndExecuteTransaction({ transaction: tx });

      // Record the tip in our backend with the transaction digest
      const response = await apiRequest("POST", "/api/tips", {
        ...params,
        txDigest: result.digest,
        walletAddress: wallet.address
      });

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tips"] });
      queryClient.invalidateQueries({ queryKey: ["/api/creators"] });
      toast({
        title: "Tip sent successfully",
        description: "Your tip has been sent to the creator."
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Transaction failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Subscription transaction
  const subscribeMutation = useMutation({
    mutationFn: async (params: SubscriptionTransactionParams) => {
      if (!wallet.connected || !wallet.address) {
        throw new Error("Connect wallet first");
      }

      // Create the subscription transaction
      const tx = new Transaction();
      tx.setGasBudget(10_000_000);

      // In a real implementation, you would call a Move contract here
      const result = await wallet.signAndExecuteTransaction({ transaction: tx });

      // Record the subscription in our backend
      const response = await apiRequest("POST", "/api/subscriptions", {
        ...params,
        txDigest: result.digest,
        walletAddress: wallet.address
      });

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users/me/subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/creators"] });
      toast({
        title: "Subscription successful",
        description: "You're now subscribed! Enjoy exclusive content."
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Subscription failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Unlock post transaction
  const unlockPostMutation = useMutation({
    mutationFn: async (params: UnlockTransactionParams) => {
      if (!wallet.connected || !wallet.address) {
        throw new Error("Connect wallet first");
      }

      // Create the unlock transaction
      const tx = new Transaction();
      tx.setGasBudget(10_000_000);

      // In a real implementation, you would call a Move contract here
      const result = await wallet.signAndExecuteTransaction({ transaction: tx });

      // Record the unlock in our backend
      const response = await apiRequest("POST", `/api/posts/${params.postId}/unlock`, {
        txDigest: result.digest,
        walletAddress: wallet.address,
        amount: params.amount
      });

      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/posts", variables.postId] });
      queryClient.invalidateQueries({ queryKey: ["/api/creators"] });
      toast({
        title: "Content unlocked",
        description: "You can now access this exclusive content."
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Unlock failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  return {
    wallet,
    linkWallet,
    tipMutation,
    subscribeMutation,
    unlockPostMutation,
    verifyWalletMutation,
    isLinking: verifyWalletMutation.isPending || getNonceMutation.isPending
  };
}