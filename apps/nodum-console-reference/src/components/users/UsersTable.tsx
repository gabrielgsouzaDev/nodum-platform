/**
 * UsersTable Component
 * 
 * Tabela estilo banco de dados com informações detalhadas dos usuários
 */

import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { User } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface UsersTableProps {
  users: User[];
}

// Mapeamento de cores para roles
const getRoleBadgeVariant = (role: string) => {
  switch (role) {
    case 'GLOBAL_ADMIN': return 'default';
    case 'SCHOOL_ADMIN': return 'secondary';
    case 'CANTEEN_OPERATOR': return 'outline';
    case 'GUARDIAN': return 'outline';
    case 'STUDENT': return 'outline';
    default: return 'outline';
  }
};

// Formatação amigável de roles
const formatRole = (role: string) => {
  const roleMap: Record<string, string> = {
    'GLOBAL_ADMIN': 'Global Admin',
    'SCHOOL_ADMIN': 'School Admin',
    'CANTEEN_OPERATOR': 'Canteen Operator',
    'GUARDIAN': 'Guardian',
    'STUDENT': 'Student',
  };
  return roleMap[role] || role;
};

export function UsersTable({ users }: UsersTableProps) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">Name</TableHead>
              <TableHead className="font-semibold">Email</TableHead>
              <TableHead className="font-semibold">Role</TableHead>
              <TableHead className="font-semibold">School</TableHead>
              <TableHead className="font-semibold">Last Login</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No users found matching the filters
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id} className="hover:bg-muted/30">
                  {/* Name */}
                  <TableCell className="font-medium">
                    <div>
                      <p className="font-semibold">{user.name}</p>
                      <p className="text-xs text-muted-foreground font-mono mt-0.5">
                        ID: {user.id}
                      </p>
                    </div>
                  </TableCell>

                  {/* Email */}
                  <TableCell>
                    <p className="text-sm">{user.email}</p>
                  </TableCell>

                  {/* Role */}
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(user.role)}>
                      {formatRole(user.role)}
                    </Badge>
                  </TableCell>

                  {/* School */}
                  <TableCell>
                    <div>
                      {user.schoolName ? (
                        <>
                          <p className="text-sm font-medium">{user.schoolName}</p>
                          {user.canteenName && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {user.canteenName}
                            </p>
                          )}
                        </>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </div>
                  </TableCell>

                  {/* Last Login */}
                  <TableCell>
                    {user.lastLoginAt ? (
                      <div className="text-sm">
                        <p className="text-muted-foreground">
                          {formatDistanceToNow(new Date(user.lastLoginAt), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </p>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">Never</span>
                    )}
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <Badge variant={user.status === 'ACTIVE' ? 'default' : 'secondary'}>
                      {user.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
