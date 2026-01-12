export type TransactionType = 'income' | 'expense'
export type TransactionStatus = 'pending' | 'completed'
export type PaymentMethod = 'money' | 'debit' | 'credit' | 'pix'

export interface Transaction {
  id: string
  date: string // ISO string
  description: string
  categoryId: string
  amount: number
  type: TransactionType
  status: TransactionStatus
  paymentMethod?: PaymentMethod
}

export interface Category {
  id: string
  name: string
  type: TransactionType
  monthlyLimit?: number
  status: 'active' | 'inactive'
  color?: string
}

export interface Goal {
  id: string
  name: string
  targetValue: number
  currentValue: number // Usually manually updated or calculated from savings
  monthlyPlannedValue: number
  deadline: string // ISO string
  status: 'in_progress' | 'completed'
}

export type UserProfileType = 'individual' | 'family'
export type Currency = 'BRL' | 'USD' | 'EUR'

export interface User {
  name: string
  profileType: UserProfileType
  currency: Currency
  baseSalary: number
  isActive: boolean
}

export interface Settings {
  startMonth: number // 0-11
  alertThreshold: number // percentage (e.g., 80)
}

export interface AppState {
  user: User
  transactions: Transaction[]
  categories: Category[]
  goals: Goal[]
  settings: Settings
}
