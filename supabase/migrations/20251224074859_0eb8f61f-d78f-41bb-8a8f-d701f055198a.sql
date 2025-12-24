-- Add UPDATE policy to chat_messages table
CREATE POLICY "Users can update their own messages"
ON public.chat_messages
FOR UPDATE
USING (auth.uid() = user_id);