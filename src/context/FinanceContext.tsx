import React, { createContext, useContext, useEffect, useState } from 'react'
import { AppState, Category, Goal, Settings, Transaction, User } from '@/types'
import { v4 as uuidv4 } from 'uuid' // We'll simulate uuid since we can't install packages. Using simple random string instead.
import { addMonths, subMonths, format } from 'date-fns'

// Simple ID generator since we can't rely on external packages for this specific file if not listed,
// but 'uuid' is not in the allowed list. I'll use a helper.
const generateId = () => Math.random().toString(36).substr(2, 9)

const DEFAULT_CATEGORIES: Category[] = [
  {
    id: '1',
    name: 'Salário',
    type: 'income',
    status: 'active',
    color: '#10B981',
  },
  {
    id: '2',
    name: 'Freelance',
    type: 'income',
    status: 'active',
    color: '#34D399',
  },
  {
    id: '3',
    name: 'Aluguel',
    type: 'expense',
    monthlyLimit: 2000,
    status: 'active',
    color: '#F43F5E',
  },
  {
    id: '4',
    name: 'Alimentação',
    type: 'expense',
    monthlyLimit: 1500,
    status: 'active',
    color: '#F59E0B',
  },
  {
    id: '5',
    name: 'Transporte',
    type: 'expense',
    monthlyLimit: 500,
    status: 'active',
    color: '#3B82F6',
  },
  {
    id: '6',
    name: 'Lazer',
    type: 'expense',
    monthlyLimit: 300,
    status: 'active',
    color: '#8B5CF6',
  },
]

const DEFAULT_USER: User = {
  name: 'Usuário Demo',
  profileType: 'individual',
  currency: 'BRL',
  baseSalary: 5000,
  isActive: true,
}

const DEFAULT_SETTINGS: Settings = {
  startMonth: 0,
  alertThreshold: 80,
}

// Generate some initial transactions
const generateInitialTransactions = (): Transaction[] => {
  const transactions: Transaction[] = []
  const today = new Date()

  // Last 3 months data
  for (let i = 0; i < 3; i++) {
    const date = subMonths(today, i)
    // Income
    transactions.push({
      id: generateId(),
      date: format(
        new Date(date.getFullYear(), date.getMonth(), 5),
        'yyyy-MM-dd',
      ),
      description: 'Salário Mensal',
      categoryId: '1',
      amount: 5000,
      type: 'income',
      status: 'completed',
    })

    // Expenses
    transactions.push({
      id: generateId(),
      date: format(
        new Date(date.getFullYear(), date.getMonth(), 10),
        'yyyy-MM-dd',
      ),
      description: 'Aluguel Apartamento',
      categoryId: '3',
      amount: 1800,
      type: 'expense',
      status: 'completed',
      paymentMethod: 'pix',
    })

    transactions.push({
      id: generateId(),
      date: format(
        new Date(date.getFullYear(), date.getMonth(), 15),
        'yyyy-MM-dd',
      ),
      description: 'Supermercado Semanal',
      categoryId: '4',
      amount: 450,
      type: 'expense',
      status: 'completed',
      paymentMethod: 'credit',
    })
  }
  return transactions
}

interface FinanceContextType extends AppState {
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void
  deleteTransaction: (id: string) => void
  addCategory: (category: Omit<Category, 'id'>) => void
  updateCategory: (id: string, category: Partial<Category>) => void
  deleteCategory: (id: string) => void
  addGoal: (goal: Omit<Goal, 'id'>) => void
  updateGoal: (id: string, goal: Partial<Goal>) => void
  deleteGoal: (id: string) => void
  updateUser: (user: Partial<User>) => void
  updateSettings: (settings: Partial<Settings>) => void
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined)

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<AppState>(() => {
    const stored = localStorage.getItem('orcamento_pessoal_data')
    if (stored) {
      return JSON.parse(stored)
    }
    return {
      user: DEFAULT_USER,
      transactions: generateInitialTransactions(),
      categories: DEFAULT_CATEGORIES,
      goals: [
        {
          id: '1',
          name: 'Reserva de Emergência',
          targetValue: 15000,
          currentValue: 5000,
          monthlyPlannedValue: 500,
          deadline: format(addMonths(new Date(), 12), 'yyyy-MM-dd'),
          status: 'in_progress',
        },
      ],
      settings: DEFAULT_SETTINGS,
    }
  })

  useEffect(() => {
    localStorage.setItem('orcamento_pessoal_data', JSON.stringify(state))
  }, [state])

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    setState((prev) => ({
      ...prev,
      transactions: [
        ...prev.transactions,
        { ...transaction, id: generateId() },
      ],
    }))
  }

  const updateTransaction = (id: string, transaction: Partial<Transaction>) => {
    setState((prev) => ({
      ...prev,
      transactions: prev.transactions.map((t) =>
        t.id === id ? { ...t, ...transaction } : t,
      ),
    }))
  }

  const deleteTransaction = (id: string) => {
    setState((prev) => ({
      ...prev,
      transactions: prev.transactions.filter((t) => t.id !== id),
    }))
  }

  const addCategory = (category: Omit<Category, 'id'>) => {
    setState((prev) => ({
      ...prev,
      categories: [...prev.categories, { ...category, id: generateId() }],
    }))
  }

  const updateCategory = (id: string, category: Partial<Category>) => {
    setState((prev) => ({
      ...prev,
      categories: prev.categories.map((c) =>
        c.id === id ? { ...c, ...category } : c,
      ),
    }))
  }

  const deleteCategory = (id: string) => {
    setState((prev) => ({
      ...prev,
      categories: prev.categories.filter((c) => c.id !== id),
    }))
  }

  const addGoal = (goal: Omit<Goal, 'id'>) => {
    setState((prev) => ({
      ...prev,
      goals: [...prev.goals, { ...goal, id: generateId() }],
    }))
  }

  const updateGoal = (id: string, goal: Partial<Goal>) => {
    setState((prev) => ({
      ...prev,
      goals: prev.goals.map((g) => (g.id === id ? { ...g, ...goal } : g)),
    }))
  }

  const deleteGoal = (id: string) => {
    setState((prev) => ({
      ...prev,
      goals: prev.goals.filter((g) => g.id !== id),
    }))
  }

  const updateUser = (user: Partial<User>) => {
    setState((prev) => ({
      ...prev,
      user: { ...prev.user, ...user },
    }))
  }

  const updateSettings = (settings: Partial<Settings>) => {
    setState((prev) => ({
      ...prev,
      settings: { ...prev.settings, ...settings },
    }))
  }

  return (
    <FinanceContext.Provider
      value={{
        ...state,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addCategory,
        updateCategory,
        deleteCategory,
        addGoal,
        updateGoal,
        deleteGoal,
        updateUser,
        updateSettings,
      }}
    >
      {children}
    </FinanceContext.Provider>
  )
}

export const useFinance = () => {
  const context = useContext(FinanceContext)
  if (context === undefined) {
    throw new Error('useFinance must be used within a FinanceProvider')
  }
  return context
}
