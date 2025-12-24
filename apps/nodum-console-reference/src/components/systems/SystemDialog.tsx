import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import type { PlatformSystem } from '@/types';

interface SystemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  system: PlatformSystem | null;
}

export function SystemDialog({ open, onOpenChange, system }: SystemDialogProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    status: 'ACTIVE',
  });

  useEffect(() => {
    if (system) {
      setFormData({
        name: system.name,
        slug: system.slug,
        description: system.description || '',
        status: system.status,
      });
    } else {
      setFormData({
        name: '',
        slug: '',
        description: '',
        status: 'ACTIVE',
      });
    }
  }, [system]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('System form submitted:', formData);
    
    toast({
      title: system ? 'System updated' : 'System created',
      description: `${formData.name} has been ${system ? 'updated' : 'created'} successfully.`,
    });
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{system ? 'Edit System' : 'Create New System'}</DialogTitle>
            <DialogDescription>
              {system ? 'Update system information' : 'Add a new platform system to NODUM'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">System Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ambra Education"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="ambra"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the system..."
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {system ? 'Update' : 'Create'} System
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
