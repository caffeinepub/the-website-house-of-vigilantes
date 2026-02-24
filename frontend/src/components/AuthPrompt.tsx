import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';
import LoginButton from './LoginButton';

interface AuthPromptProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message: string;
}

export default function AuthPrompt({
  open,
  onOpenChange,
  message,
}: AuthPromptProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-vangogh-blue/5 to-vangogh-yellow/5 border-2 border-vangogh-yellow/30 rounded-3xl">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-vangogh-blue/10 rounded-full">
              <Lock className="h-8 w-8 text-vangogh-blue" />
            </div>
          </div>
          <DialogTitle className="text-2xl font-serif text-center">
            Authentication Required
          </DialogTitle>
          <DialogDescription className="text-center text-base pt-2">
            {message}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center flex-col gap-3">
          <LoginButton />
          <Button
            onClick={() => onOpenChange(false)}
            variant="ghost"
            className="text-muted-foreground hover:text-foreground"
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
