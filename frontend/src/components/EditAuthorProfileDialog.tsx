import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useSaveCallerUserProfile } from '../hooks/useQueries';
import { toast } from 'sonner';
import type { UserProfile } from '../backend';

interface ExtendedProfile {
  bio: string;
  website: string;
  social: {
    twitter: string;
    facebook: string;
    instagram: string;
  };
}

interface EditAuthorProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentProfile: UserProfile | null | undefined;
  extendedProfile: ExtendedProfile;
}

export default function EditAuthorProfileDialog({
  open,
  onOpenChange,
  currentProfile,
  extendedProfile,
}: EditAuthorProfileDialogProps) {
  const [name, setName] = useState(currentProfile?.name || '');
  const [bio, setBio] = useState(extendedProfile.bio || '');
  const [website, setWebsite] = useState(extendedProfile.website || '');
  const [twitter, setTwitter] = useState(extendedProfile.social.twitter || '');
  const [facebook, setFacebook] = useState(extendedProfile.social.facebook || '');
  const [instagram, setInstagram] = useState(extendedProfile.social.instagram || '');
  
  const saveProfile = useSaveCallerUserProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Please enter your name');
      return;
    }

    // Validate URLs if provided
    const urlFields = [
      { value: website, name: 'Website' },
      { value: twitter, name: 'Twitter' },
      { value: facebook, name: 'Facebook' },
      { value: instagram, name: 'Instagram' },
    ];

    for (const field of urlFields) {
      if (field.value && !isValidUrl(field.value)) {
        toast.error(`${field.name} URL is invalid`);
        return;
      }
    }

    try {
      // Save name to backend
      await saveProfile.mutateAsync({ 
        name: name.trim(),
        isAuthor: currentProfile?.isAuthor || false // Preserve author status
      });
      
      // Store extended profile in localStorage (until backend supports it)
      localStorage.setItem('authorExtendedProfile', JSON.stringify({
        bio: bio.trim(),
        website: website.trim(),
        social: {
          twitter: twitter.trim(),
          facebook: facebook.trim(),
          instagram: instagram.trim(),
        },
      }));

      toast.success('Profile updated successfully!');
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to update profile');
      console.error('Profile update error:', error);
    }
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl rounded-3xl border-2 border-vangogh-yellow/30 max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-2xl font-serif">Edit Author Profile</DialogTitle>
            <DialogDescription>
              Update your author profile information and social links
            </DialogDescription>
          </DialogHeader>

          <div className="py-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name / Pen Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name or pen name"
                className="rounded-2xl"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio / About</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell readers about yourself..."
                className="rounded-2xl min-h-[120px]"
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground">
                {bio.length}/500 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website URL</Label>
              <Input
                id="website"
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://yourwebsite.com"
                className="rounded-2xl"
              />
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Social Links</h3>
              
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="twitter">Twitter / X</Label>
                  <Input
                    id="twitter"
                    type="url"
                    value={twitter}
                    onChange={(e) => setTwitter(e.target.value)}
                    placeholder="https://twitter.com/username"
                    className="rounded-2xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="facebook">Facebook</Label>
                  <Input
                    id="facebook"
                    type="url"
                    value={facebook}
                    onChange={(e) => setFacebook(e.target.value)}
                    placeholder="https://facebook.com/username"
                    className="rounded-2xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    type="url"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    placeholder="https://instagram.com/username"
                    className="rounded-2xl"
                  />
                </div>
              </div>
            </div>

            <p className="text-xs text-muted-foreground italic">
              * Extended profile fields (bio, social links) are stored locally until backend integration is added.
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-full"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saveProfile.isPending}
              className="bg-vangogh-blue hover:bg-vangogh-blue/90 text-white rounded-full"
            >
              {saveProfile.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
