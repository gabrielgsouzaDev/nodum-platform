/**
 * SchoolsView Component
 * 
 * Gestão de escolas com filtros avançados por sistema e status
 * Modal detalhado com abas para visualização completa
 */

import { useState } from 'react';
import { Plus, Filter, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { mockSchools, mockSystems } from '@/lib/mock-data';
import { SchoolsTable } from './SchoolsTable';
import { SchoolDialog } from './SchoolDialog';
import { SchoolDetailDialog } from './SchoolDetailDialog';
import type { School } from '@/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function SchoolsView() {
  const [schools] = useState(mockSchools);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [systemFilter, setSystemFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSchools = schools.filter((school) => {
    const matchesStatus = statusFilter === 'all' || school.status === statusFilter;
    const matchesSystem = systemFilter === 'all' || school.systemId === systemFilter;
    const matchesSearch = school.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         school.taxId.includes(searchQuery) ||
                         school.systemName?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSystem && matchesSearch;
  });

  const handleCreate = () => {
    setSelectedSchool(null);
    setDialogOpen(true);
  };

  const handleEdit = (school: School) => {
    setSelectedSchool(school);
    setDialogOpen(true);
  };

  const handleViewDetails = (school: School) => {
    setSelectedSchool(school);
    setDetailDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Schools</h2>
          <p className="text-muted-foreground mt-1">Manage schools across all systems</p>
        </div>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="w-4 h-4" />
          New School
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, tax ID, or system..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <Select value={systemFilter} onValueChange={setSystemFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="System" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Systems</SelectItem>
            {mockSystems.map((system) => (
              <SelectItem key={system.id} value={system.id}>
                {system.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="SUSPENDED">Suspended</SelectItem>
            <SelectItem value="CANCELED">Canceled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        Showing <span className="font-semibold text-foreground">{filteredSchools.length}</span> of {schools.length} schools
      </div>

      <SchoolsTable schools={filteredSchools} onEdit={handleEdit} onViewDetails={handleViewDetails} />

      <SchoolDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        school={selectedSchool}
      />

      <SchoolDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        school={selectedSchool}
      />
    </div>
  );
}
