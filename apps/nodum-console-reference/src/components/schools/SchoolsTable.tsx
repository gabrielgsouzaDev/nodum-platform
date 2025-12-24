/**
 * SchoolsTable Component
 * 
 * Tabela responsiva de escolas com ação de visualização detalhada
 */

import { MoreVertical, Edit, Trash2, ExternalLink, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { School } from '@/types';

interface SchoolsTableProps {
  schools: School[];
  onEdit: (school: School) => void;
  onViewDetails: (school: School) => void;
}

export function SchoolsTable({ schools, onEdit, onViewDetails }: SchoolsTableProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'default';
      case 'PENDING': return 'secondary';
      case 'SUSPENDED': return 'destructive';
      case 'CANCELED': return 'outline';
      default: return 'secondary';
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>School Name</TableHead>
              <TableHead>System</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Students</TableHead>
              <TableHead className="text-right">Revenue</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {schools.map((school) => (
              <TableRow key={school.id} className="hover:bg-muted/50">
                <TableCell>
                  <div>
                    <p className="font-semibold">{school.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-muted-foreground font-mono">{school.slug}</p>
                      {school.customDomain && (
                        <a
                          href={`https://${school.customDomain}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-accent hover:underline flex items-center gap-1"
                        >
                          {school.customDomain}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <p className="text-sm">{school.systemName}</p>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{school.planName}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusColor(school.status)}>
                    {school.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-mono">
                  {school.studentCount}
                </TableCell>
                <TableCell className="text-right font-mono">
                  ${school.monthlyRevenue?.toLocaleString()}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onViewDetails(school)}>
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit(school)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Quick Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
