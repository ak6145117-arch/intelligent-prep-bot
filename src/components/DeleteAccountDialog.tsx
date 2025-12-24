import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2, Mail, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const REQUEST_DELETION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/request-account-deletion`;

interface DeleteAccountDialogProps {
  userEmail: string;
}

const DeleteAccountDialog = ({ userEmail }: DeleteAccountDialogProps) => {
  const [isRequesting, setIsRequesting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleRequestDeletion = async () => {
    setIsRequesting(true);

    try {
      // Get the user's JWT token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(REQUEST_DELETION_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to request account deletion");
      }

      setEmailSent(true);
      toast({
        title: "Confirmation Email Sent",
        description: "Please check your inbox to confirm account deletion.",
      });
    } catch (error) {
      console.error("Request deletion error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to request account deletion",
        variant: "destructive",
      });
    } finally {
      setIsRequesting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      // Reset state when dialog closes
      setEmailSent(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="sm" className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10">
          <Trash2 className="w-4 h-4 mr-2" />
          Delete Account
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-destructive">Delete Account</AlertDialogTitle>
          <AlertDialogDescription className="space-y-3" asChild>
            <div>
              {!emailSent ? (
                <>
                  <p>
                    This action is <strong>permanent and cannot be undone</strong>. All your data will be deleted, including:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Your profile information</li>
                    <li>All chat sessions and messages</li>
                    <li>Your account credentials</li>
                  </ul>
                  <div className="bg-muted/50 rounded-lg p-3 mt-3">
                    <p className="text-sm flex items-start gap-2">
                      <Mail className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>
                        For security, we'll send a confirmation email to <strong>{userEmail}</strong>. 
                        You must click the link in that email to complete the deletion.
                      </span>
                    </p>
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <p className="font-medium text-foreground mb-2">Confirmation Email Sent</p>
                  <p className="text-sm">
                    We've sent an email to <strong>{userEmail}</strong> with a confirmation link.
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    The link will expire in 1 hour.
                  </p>
                </div>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {!emailSent ? (
            <>
              <AlertDialogCancel disabled={isRequesting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleRequestDeletion}
                disabled={isRequesting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isRequesting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Confirmation Email"
                )}
              </AlertDialogAction>
            </>
          ) : (
            <Button onClick={() => handleOpenChange(false)} className="w-full">
              Close
            </Button>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteAccountDialog;
