/**
 * SystemsView Component
 * 
 * Gerenciamento de sistemas da plataforma
 * Layout responsivo em grid
 */

import { useState } from 'react';
import { Plus, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { mockSystems } from '@/lib/mock-data';
import { SystemDialog } from './SystemDialog';
import type { PlatformSystem } from '@/types';

export function SystemsView() {
  const [systems] = useState(mockSystems);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSystem, setSelectedSystem] = useState<PlatformSystem | null>(null);

  const handleCreate = () => {
    setSelectedSystem(null);
    setDialogOpen(true);
  };

  const handleEdit = (system: PlatformSystem) => {
    setSelectedSystem(system);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Systems</h2>
          <p className="text-muted-foreground mt-1">Manage all platform systems</p>
        </div>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="w-4 h-4" />
          New System
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {systems.map((system) => (
          <Card key={system.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-xl">{system.name}</h3>
                  <p className="text-sm text-muted-foreground font-mono mt-1">/{system.slug}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={system.status === 'ACTIVE' ? 'default' : 'secondary'}>
                    {system.status}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(system)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mb-6 line-clamp-2">
                {system.description || 'No description'}
              </p>

              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-muted/30 rounded-lg">
                  <p className="text-2xl font-bold">{system.schoolCount}</p>
                  <p className="text-xs text-muted-foreground mt-1">Schools</p>
                </div>
                <div className="text-center p-3 bg-accent/10 rounded-lg">
                  <p className="text-2xl font-bold text-accent">{system.activeSchools}</p>
                  <p className="text-xs text-muted-foreground mt-1">Active</p>
                </div>
                <div className="text-center p-3 bg-primary/10 rounded-lg">
                  <p className="text-2xl font-bold text-primary">{system.totalStudents?.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground mt-1">Students</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t">
                <p className="text-xs text-muted-foreground">
                  Created {new Date(system.createdAt).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <SystemDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        system={selectedSystem}
      />
    </div>
  );
}
