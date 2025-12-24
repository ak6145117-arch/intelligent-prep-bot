-- Create table for account deletion requests
CREATE TABLE public.account_deletion_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  token UUID NOT NULL DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '1 hour'),
  confirmed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(token)
);

-- Enable RLS
ALTER TABLE public.account_deletion_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own deletion requests
CREATE POLICY "Users can view their own deletion requests"
ON public.account_deletion_requests
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own deletion requests
CREATE POLICY "Users can create their own deletion requests"
ON public.account_deletion_requests
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create index for token lookup
CREATE INDEX idx_deletion_requests_token ON public.account_deletion_requests(token);

-- Create index for cleanup of expired requests
CREATE INDEX idx_deletion_requests_expires ON public.account_deletion_requests(expires_at);