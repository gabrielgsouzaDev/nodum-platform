/**
 * PaymentsTable Component
 * 
 * Tabela de pagamentos com formatação profissional e responsiva
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
import type { Payment } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PaymentsTableProps {
  payments: Payment[];
}

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case 'PAID': return 'default';
    case 'PENDING': return 'secondary';
    case 'OVERDUE': return 'destructive';
    case 'FAILED': return 'outline';
    default: return 'secondary';
  }
};

export function PaymentsTable({ payments }: PaymentsTableProps) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">Invoice</TableHead>
              <TableHead className="font-semibold">School</TableHead>
              <TableHead className="font-semibold">Plan</TableHead>
              <TableHead className="font-semibold text-right">Amount</TableHead>
              <TableHead className="font-semibold">Due Date</TableHead>
              <TableHead className="font-semibold">Paid Date</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">Payment Method</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No payments found matching the filters
                </TableCell>
              </TableRow>
            ) : (
              payments.map((payment) => (
                <TableRow key={payment.id} className="hover:bg-muted/30">
                  {/* Invoice */}
                  <TableCell className="font-mono text-sm font-medium">
                    {payment.invoiceNumber}
                  </TableCell>

                  {/* School */}
                  <TableCell>
                    <p className="font-medium">{payment.schoolName}</p>
                  </TableCell>

                  {/* Plan */}
                  <TableCell>
                    <Badge variant="outline">{payment.planName}</Badge>
                  </TableCell>

                  {/* Amount */}
                  <TableCell className="text-right">
                    <p className="font-semibold font-mono">
                      ${payment.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                  </TableCell>

                  {/* Due Date */}
                  <TableCell>
                    <p className="text-sm">
                      {format(new Date(payment.dueDate), 'dd MMM yyyy', { locale: ptBR })}
                    </p>
                  </TableCell>

                  {/* Paid Date */}
                  <TableCell>
                    {payment.paidDate ? (
                      <p className="text-sm text-green-600">
                        {format(new Date(payment.paidDate), 'dd MMM yyyy', { locale: ptBR })}
                      </p>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(payment.status)}>
                      {payment.status}
                    </Badge>
                  </TableCell>

                  {/* Payment Method */}
                  <TableCell>
                    {payment.paymentMethod ? (
                      <p className="text-sm">{payment.paymentMethod}</p>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
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
