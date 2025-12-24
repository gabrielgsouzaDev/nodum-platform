/**
 * DashboardView Component
 * 
 * Dashboard principal com métricas e visão geral do sistema
 * Layout totalmente responsivo para todos os dispositivos
 */

import { Network, Building2, Users, DollarSign, AlertCircle, TrendingUp } from 'lucide-react';
import { MetricCard } from './MetricCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { mockMetrics, mockSystems, mockSchools } from '@/lib/mock-data';
import { Badge } from '@/components/ui/badge';

export function DashboardView() {
  const recentSchools = mockSchools.slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground mt-1">Welcome to NODUM Platform Control</p>
      </div>

      {/* Metrics Grid - Responsivo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <MetricCard
          title="Total Systems"
          value={mockMetrics.totalSystems}
          change={12}
          icon={Network}
          iconColor="bg-primary"
        />
        <MetricCard
          title="Active Schools"
          value={mockMetrics.activeSchools}
          change={8}
          icon={Building2}
          iconColor="bg-accent"
        />
        <MetricCard
          title="Total Students"
          value={mockMetrics.totalStudents.toLocaleString()}
          change={15}
          icon={Users}
          iconColor="bg-blue-600"
        />
        <MetricCard
          title="Monthly Revenue"
          value={`$${mockMetrics.monthlyRevenue.toLocaleString()}`}
          change={22}
          icon={DollarSign}
          iconColor="bg-green-600"
        />
        <MetricCard
          title="Pending Schools"
          value={mockMetrics.pendingSchools}
          icon={AlertCircle}
          iconColor="bg-orange-600"
        />
        <MetricCard
          title="Total Schools"
          value={mockMetrics.totalSchools}
          change={5}
          icon={TrendingUp}
          iconColor="bg-purple-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Systems Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Systems Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockSystems.map((system) => (
                <div key={system.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-muted/30 rounded-lg gap-2 sm:gap-0">
                  <div>
                    <p className="font-semibold">{system.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {system.activeSchools}/{system.schoolCount} schools active
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="font-mono font-semibold">{system.totalStudents?.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">students</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Schools */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Schools</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentSchools.map((school) => (
                <div key={school.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-muted/30 rounded-lg gap-2 sm:gap-0">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{school.name}</p>
                      <Badge variant={
                        school.status === 'ACTIVE' ? 'default' :
                        school.status === 'PENDING' ? 'secondary' :
                        'destructive'
                      }>
                        {school.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{school.systemName}</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="font-mono text-sm font-semibold">{school.studentCount}</p>
                    <p className="text-xs text-muted-foreground">students</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
