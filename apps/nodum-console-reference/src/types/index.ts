// ==========================================
// ENUMS & TYPES
// ==========================================

export type SchoolStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'CANCELED';
export type PlanStatus = 'ACTIVE' | 'RETIRED';
export type UserRole = 'GLOBAL_ADMIN' | 'SCHOOL_ADMIN' | 'CANTEEN_OPERATOR' | 'GUARDIAN' | 'STUDENT';
export type PaymentStatus = 'PENDING' | 'PAID' | 'OVERDUE' | 'FAILED';

export interface PlatformSystem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: string;
  schoolCount?: number;
  activeSchools?: number;
  totalStudents?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Plan {
  id: string;
  name: string;
  description: string | null;
  price: number;
  discountPercent: number;
  maxStudents: number;
  maxCanteens: number;
  status: PlanStatus;
  features: string[] | null;
  createdAt: string;
  updatedAt: string;
}

export interface School {
  id: string;
  name: string;
  taxId: string;
  slug: string;
  customDomain: string | null;
  status: SchoolStatus;
  systemId: string;
  systemName?: string;
  planId: string;
  planName?: string;
  studentCount?: number;
  canteenCount?: number;
  totalOrders?: number;
  monthlyRevenue?: number;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardMetrics {
  totalSystems: number;
  totalSchools: number;
  activeSchools: number;
  totalStudents: number;
  monthlyRevenue: number;
  pendingSchools: number;
}

// ==========================================
// USER MANAGEMENT
// ==========================================

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  schoolId: string | null;
  schoolName?: string;
  canteenId: string | null;
  canteenName?: string;
  lastLoginAt: string | null;
  createdAt: string;
  status: 'ACTIVE' | 'INACTIVE';
}

// ==========================================
// FINANCE MANAGEMENT
// ==========================================

export interface Payment {
  id: string;
  schoolId: string;
  schoolName: string;
  planName: string;
  amount: number;
  dueDate: string;
  paidDate: string | null;
  status: PaymentStatus;
  invoiceNumber: string;
  paymentMethod?: string;
  transactionId?: string;
}

// ==========================================
// CHART DATA
// ==========================================

export interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: any;
}
