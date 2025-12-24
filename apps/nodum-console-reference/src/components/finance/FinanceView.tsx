/**
 * FinanceView Component
 * 
 * Gestão financeira inteligente com visualização de pagamentos de planos
 * e filtros avançados para análise financeira
 */

import { useState } from 'react';
import { Search, Filter, Download, TrendingUp, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { mockPayments } from '@/lib/mock-data';
import { PaymentsTable } from './PaymentsTable';
import type { PaymentStatus } from '@/types';

export function FinanceView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('all');

  // Filtros inteligentes
  const filteredPayments = mockPayments.filter((payment) => {
    const matchesSearch = 
      payment.schoolName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    const matchesPlan = planFilter === 'all' || payment.planName === planFilter;
    
    // Filtro de data
    let matchesDate = true;
    if (dateRange !== 'all') {
      const dueDate = new Date(payment.dueDate);
      const now = new Date();
      
      if (dateRange === 'this-month') {
        matchesDate = dueDate.getMonth() === now.getMonth() && 
                     dueDate.getFullYear() === now.getFullYear();
      } else if (dateRange === 'overdue') {
        matchesDate = payment.status === 'OVERDUE' || 
                     (payment.status === 'PENDING' && dueDate < now);
      }
    }

    return matchesSearch && matchesStatus && matchesPlan && matchesDate;
  });

  // Métricas calculadas
  const totalReceived = mockPayments
    .filter(p => p.status === 'PAID')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalPending = mockPayments
    .filter(p => p.status === 'PENDING')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalOverdue = mockPayments
    .filter(p => p.status === 'OVERDUE')
    .reduce((sum, p) => sum + p.amount, 0);

  const uniquePlans = Array.from(new Set(mockPayments.map(p => p.planName)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Finance Management</h2>
          <p className="text-muted-foreground mt-1">Monitor payments and revenue across all schools</p>
        </div>
        <Button className="gap-2">
          <Download className="w-4 h-4" />
          Export Report
        </Button>
      </div>

      {/* Métricas Financeiras */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <Card className="overflow-hidden border-l-4 border-l-green-600">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Received</p>
                <p className="text-2xl md:text-3xl font-bold mt-2">${totalReceived.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  Paid invoices
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-l-4 border-l-orange-600">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl md:text-3xl font-bold mt-2">${totalPending.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                <p className="text-xs text-orange-600 mt-1">
                  {mockPayments.filter(p => p.status === 'PENDING').length} invoices
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <AlertCircle className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-l-4 border-l-red-600">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Overdue</p>
                <p className="text-2xl md:text-3xl font-bold mt-2">${totalOverdue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                <p className="text-xs text-red-600 mt-1">
                  {mockPayments.filter(p => p.status === 'OVERDUE').length} invoices
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by school or invoice number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="PAID">Paid</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="OVERDUE">Overdue</SelectItem>
            <SelectItem value="FAILED">Failed</SelectItem>
          </SelectContent>
        </Select>

        <Select value={planFilter} onValueChange={setPlanFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Plan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Plans</SelectItem>
            {uniquePlans.map((plan) => (
              <SelectItem key={plan} value={plan}>
                {plan}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Date Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="this-month">This Month</SelectItem>
            <SelectItem value="overdue">Overdue Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        Showing <span className="font-semibold text-foreground">{filteredPayments.length}</span> of {mockPayments.length} payments
      </div>

      {/* Payments Table */}
      <PaymentsTable payments={filteredPayments} />
    </div>
  );
}
