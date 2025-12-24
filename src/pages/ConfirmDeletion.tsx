import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Loader2, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const CONFIRM_DELETION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/confirm-account-deletion`;

const ConfirmDeletion = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error" | "expired">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("error");
      setErrorMessage("Invalid confirmation link. No token provided.");
      return;
    }

    const confirmDeletion = async () => {
      try {
        const response = await fetch(CONFIRM_DELETION_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (response.status === 410) {
          setStatus("expired");
          setErrorMessage(data.error || "This confirmation link has expired.");
        } else if (!response.ok) {
          setStatus("error");
          setErrorMessage(data.error || "Failed to delete account.");
        } else {
          setStatus("success");
        }
      } catch (error) {
        setStatus("error");
        setErrorMessage("An unexpected error occurred. Please try again.");
      }
    };

    confirmDeletion();
  }, [searchParams]);

  return (
    <>
      <Helmet>
        <title>Confirm Account Deletion - IntelliPrep</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            {status === "loading" && (
              <>
                <Loader2 className="w-12 h-12 mx-auto text-primary animate-spin mb-4" />
                <CardTitle>Processing Deletion</CardTitle>
                <CardDescription>Please wait while we delete your account...</CardDescription>
              </>
            )}

            {status === "success" && (
              <>
                <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-4" />
                <CardTitle className="text-green-600">Account Deleted</CardTitle>
                <CardDescription>
                  Your account and all associated data have been permanently deleted.
                </CardDescription>
              </>
            )}

            {status === "expired" && (
              <>
                <AlertTriangle className="w-12 h-12 mx-auto text-yellow-500 mb-4" />
                <CardTitle className="text-yellow-600">Link Expired</CardTitle>
                <CardDescription>{errorMessage}</CardDescription>
              </>
            )}

            {status === "error" && (
              <>
                <XCircle className="w-12 h-12 mx-auto text-destructive mb-4" />
                <CardTitle className="text-destructive">Deletion Failed</CardTitle>
                <CardDescription>{errorMessage}</CardDescription>
              </>
            )}
          </CardHeader>

          <CardContent className="flex justify-center">
            {status === "success" && (
              <Button onClick={() => navigate("/")} className="w-full">
                Return to Home
              </Button>
            )}

            {(status === "error" || status === "expired") && (
              <div className="space-y-2 w-full">
                <Button onClick={() => navigate("/")} variant="outline" className="w-full">
                  Return to Home
                </Button>
                {status === "expired" && (
                  <p className="text-sm text-muted-foreground text-center">
                    Please log in and request a new deletion link from your account settings.
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default ConfirmDeletion;
