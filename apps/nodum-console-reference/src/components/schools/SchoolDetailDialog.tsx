/**
 * SchoolDetailDialog Component
 * 
 * Modal avançado com abas para visualização/edição completa de escolas
 */

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Building2, 
  Users, 
  DollarSign, 
  CreditCard, 
  Settings,
  TrendingUp,
  ShoppingCart
} from 'lucide-react';
import type { School } from '@/types';

interface SchoolDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  school: School | null;
}

export function SchoolDetailDialog({ open, onOpenChange, school }: SchoolDetailDialogProps) {
  const [activeTab, setActiveTab] = useState('overview');

  if (!school) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl">{school.name}</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1 font-mono">
                {school.slug} • {school.taxId}
              </p>
            </div>
            <Badge variant={
              school.status === 'ACTIVE' ? 'default' :
              school.status === 'PENDING' ? 'secondary' :
              'destructive'
            }>
              {school.status}
            </Badge>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="gap-2">
              <Building2 className="w-4 h-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="metrics" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Metrics</span>
            </TabsTrigger>
            <TabsTrigger value="plan" className="gap-2">
              <CreditCard className="w-4 h-4" />
              <span className="hidden sm:inline">Plan</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">School Information</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">School Name</Label>
                  <p className="font-semibold mt-1">{school.name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Tax ID</Label>
                  <p className="font-mono mt-1">{school.taxId}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Slug</Label>
                  <p className="font-mono mt-1">/{school.slug}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Custom Domain</Label>
                  <p className="mt-1">{school.customDomain || '—'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">System</Label>
                  <p className="mt-1">{school.systemName}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Current Plan</Label>
                  <Badge variant="outline" className="mt-1">{school.planName}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <Users className="w-6 h-6 mx-auto text-primary mb-2" />
                    <p className="text-2xl font-bold">{school.studentCount}</p>
                    <p className="text-xs text-muted-foreground mt-1">Students</p>
                  </div>
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <Building2 className="w-6 h-6 mx-auto text-accent mb-2" />
                    <p className="text-2xl font-bold">{school.canteenCount}</p>
                    <p className="text-xs text-muted-foreground mt-1">Canteens</p>
                  </div>
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <ShoppingCart className="w-6 h-6 mx-auto text-blue-600 mb-2" />
                    <p className="text-2xl font-bold">{school.totalOrders}</p>
                    <p className="text-xs text-muted-foreground mt-1">Orders</p>
                  </div>
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <DollarSign className="w-6 h-6 mx-auto text-green-600 mb-2" />
                    <p className="text-2xl font-bold">${school.monthlyRevenue?.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground mt-1">Revenue</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Metrics Tab */}
          <TabsContent value="metrics" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">Total Orders</p>
                    <p className="text-3xl font-bold">{school.totalOrders}</p>
                    <p className="text-xs text-green-600 mt-1">+12% from last month</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">Monthly Revenue</p>
                    <p className="text-3xl font-bold">${school.monthlyRevenue?.toLocaleString()}</p>
                    <p className="text-xs text-green-600 mt-1">+8% from last month</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">Avg Order Value</p>
                    <p className="text-3xl font-bold">
                      ${((school.monthlyRevenue || 0) / (school.totalOrders || 1)).toFixed(2)}
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">Active Students</p>
                    <p className="text-3xl font-bold">{school.studentCount}</p>
                    <p className="text-xs text-muted-foreground mt-1">Total enrolled</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Plan Tab */}
          <TabsContent value="plan" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Subscription Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Current Plan</Label>
                    <p className="text-xl font-bold mt-1">{school.planName}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Plan Status</Label>
                    <Badge className="mt-1">Active</Badge>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Next Billing Date</Label>
                    <p className="mt-1">January 5, 2025</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Billing Cycle</Label>
                    <p className="mt-1">Monthly</p>
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <Button variant="outline" className="w-full">Change Plan</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">School Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">School Name</Label>
                  <Input id="edit-name" defaultValue={school.name} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-slug">Slug</Label>
                  <Input id="edit-slug" defaultValue={school.slug} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-domain">Custom Domain</Label>
                  <Input id="edit-domain" defaultValue={school.customDomain || ''} placeholder="Optional" />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button className="flex-1">Save Changes</Button>
                  <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
