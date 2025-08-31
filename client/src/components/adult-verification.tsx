import React, { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

import { Upload, FileImage, AlertTriangle, CheckCircle, X, Shield } from "lucide-react";

const adultVerificationSchema = z.object({
  idImage: z.any().refine((files) => files?.length === 1, "ID image is required"),
  selfie: z.any().refine((files) => files?.length === 1, "Selfie is required"),
});

interface AdultVerificationProps {
  onSuccess?: () => void;
}

export default function AdultVerification({ onSuccess }: AdultVerificationProps) {
  const { toast } = useToast();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [idImagePreview, setIdImagePreview] = useState<string | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);

  // Get current verification status
  const { data: adultStatus, isLoading } = useQuery<{
    isAdultCreatorRequested: boolean;
    isAdultCreatorVerified: boolean;
    adultReviewStatus: string;
  }>({
    queryKey: ["/api/adult/status"],
  });

  const form = useForm({
    resolver: zodResolver(adultVerificationSchema),
  });

  const submitVerificationMutation = useMutation({
    mutationFn: async (data: z.infer<typeof adultVerificationSchema>) => {
      const formData = new FormData();
      formData.append("idImage", data.idImage[0]);
      formData.append("selfie", data.selfie[0]);

      setUploadProgress(25);
      
      const response = await fetch("/api/adult/kyc", {
        method: "POST",
        body: formData,
      });

      setUploadProgress(75);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to submit verification");
      }

      setUploadProgress(100);
      return response.json();
    },
    onSuccess: () => {
      toast({ 
        title: "Verification submitted successfully", 
        description: "Your documents have been submitted for review. We'll notify you once reviewed." 
      });
      queryClient.invalidateQueries({ queryKey: ["/api/adult/status"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      form.reset();
      setIdImagePreview(null);
      setSelfiePreview(null);
      setUploadProgress(0);
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast({ 
        title: "Verification failed", 
        description: error.message, 
        variant: "destructive" 
      });
      setUploadProgress(0);
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, type: 'id' | 'selfie') => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (type === 'id') {
          setIdImagePreview(result);
        } else {
          setSelfiePreview(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  if (isLoading) {
    return (
      <Card className="glass">
        <CardContent className="p-8 text-center">
          <div className="animate-pulse">Loading verification status...</div>
        </CardContent>
      </Card>
    );
  }

  // Show status if already submitted
  if (adultStatus?.isAdultCreatorRequested) {
    return (
      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Adult Content Verification Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center gap-4">
            {adultStatus.isAdultCreatorVerified ? (
              <>
                <CheckCircle className="w-8 h-8 text-green-500" />
                <div className="text-center">
                  <Badge variant="default" className="bg-green-500 mb-2" data-testid="badge-verified">
                    Verified
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    You are verified to post adult content
                  </p>
                </div>
              </>
            ) : adultStatus.adultReviewStatus === "pending" ? (
              <>
                <AlertTriangle className="w-8 h-8 text-yellow-500" />
                <div className="text-center">
                  <Badge variant="secondary" className="bg-yellow-500 text-white mb-2" data-testid="badge-pending">
                    Under Review
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    Your documents are being reviewed by our team
                  </p>
                </div>
              </>
            ) : adultStatus.adultReviewStatus === "rejected" ? (
              <>
                <X className="w-8 h-8 text-red-500" />
                <div className="text-center">
                  <Badge variant="destructive" className="mb-2" data-testid="badge-rejected">
                    Rejected
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    Your verification was rejected. Please contact support for details.
                  </p>
                </div>
              </>
            ) : null}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Adult Content Verification
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            To post NSFW/18+ content, you must verify your identity by uploading a government-issued ID and a selfie. 
            This is required to comply with age verification regulations.
          </AlertDescription>
        </Alert>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(data => submitVerificationMutation.mutate(data))} className="space-y-6">
            {/* ID Image Upload */}
            <FormField
              control={form.control}
              name="idImage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Government-Issued ID</FormLabel>
                  <FormControl>
                    <div className="space-y-4">
                      <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            field.onChange(e.target.files);
                            handleFileChange(e, 'id');
                          }}
                          className="hidden"
                          id="id-upload"
                          data-testid="input-id-image"
                        />
                        <Label 
                          htmlFor="id-upload" 
                          className="cursor-pointer flex flex-col items-center gap-2"
                        >
                          <FileImage className="w-8 h-8 text-muted-foreground" />
                          <span className="text-sm font-medium">Upload ID Image</span>
                          <span className="text-xs text-muted-foreground">
                            Driver's license, passport, or other government ID
                          </span>
                        </Label>
                      </div>
                      {idImagePreview && (
                        <div className="relative inline-block">
                          <img 
                            src={idImagePreview} 
                            alt="ID preview" 
                            className="w-32 h-20 object-cover rounded border"
                            data-testid="img-id-preview"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0"
                            onClick={() => {
                              setIdImagePreview(null);
                              form.setValue("idImage", null);
                            }}
                            data-testid="button-remove-id"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Selfie Upload */}
            <FormField
              control={form.control}
              name="selfie"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Selfie with ID</FormLabel>
                  <FormControl>
                    <div className="space-y-4">
                      <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            field.onChange(e.target.files);
                            handleFileChange(e, 'selfie');
                          }}
                          className="hidden"
                          id="selfie-upload"
                          data-testid="input-selfie"
                        />
                        <Label 
                          htmlFor="selfie-upload" 
                          className="cursor-pointer flex flex-col items-center gap-2"
                        >
                          <FileImage className="w-8 h-8 text-muted-foreground" />
                          <span className="text-sm font-medium">Upload Selfie</span>
                          <span className="text-xs text-muted-foreground">
                            Photo of yourself holding your ID next to your face
                          </span>
                        </Label>
                      </div>
                      {selfiePreview && (
                        <div className="relative inline-block">
                          <img 
                            src={selfiePreview} 
                            alt="Selfie preview" 
                            className="w-32 h-20 object-cover rounded border"
                            data-testid="img-selfie-preview"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0"
                            onClick={() => {
                              setSelfiePreview(null);
                              form.setValue("selfie", null);
                            }}
                            data-testid="button-remove-selfie"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Upload Progress */}
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading documents...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="w-full" />
              </div>
            )}

            <Button 
              type="submit" 
              className="gradient-primary text-primary-foreground w-full"
              disabled={submitVerificationMutation.isPending || uploadProgress > 0}
              data-testid="button-submit-verification"
            >
              {submitVerificationMutation.isPending ? (
                <>
                  <Upload className="w-4 h-4 mr-2 animate-spin" />
                  Submitting Verification...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Submit for Verification
                </>
              )}
            </Button>
          </form>
        </Form>

        <div className="text-xs text-muted-foreground space-y-2">
          <p><strong>Privacy Notice:</strong> Your uploaded documents are securely stored and only used for age verification purposes.</p>
          <p><strong>Processing Time:</strong> Verification typically takes 1-3 business days.</p>
          <p><strong>Requirements:</strong> Both you and your ID must be clearly visible in the selfie.</p>
        </div>
      </CardContent>
    </Card>
  );
}