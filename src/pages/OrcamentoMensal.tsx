import { useFinance } from '@/context/FinanceContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function OrcamentoMensal() {
  const { categories, user, transactions } = useFinance()
  const now = new Date()
  const currentMonth = now.toISOString().substring(0, 7) // YYYY-MM

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: user.currency,
    }).format(value)
  }

  // Budget Calculation
  // We assume user base salary is the planned income
  const plannedIncome = user.baseSalary

  const expenseCategories = categories
    .filter((c) => c.type === 'expense')
    .map((c) => {
      const spent = transactions
        .filter(
          (t) =>
            t.categoryId === c.id &&
            t.type === 'expense' &&
            t.date.startsWith(currentMonth),
        )
        .reduce((acc, t) => acc + t.amount, 0)

      const limit = c.monthlyLimit || 0
      const remaining = limit - spent
      return { ...c, spent, limit, remaining }
    })

  const totalPlannedExpenses = expenseCategories.reduce(
    (acc, c) => acc + c.limit,
    0,
  )
  const totalActualExpenses = expenseCategories.reduce(
    (acc, c) => acc + c.spent,
    0,
  )

  const plannedBalance = plannedIncome - totalPlannedExpenses
  const currentBalanceProjection = plannedIncome - totalActualExpenses

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Orçamento Mensal</h2>
        <p className="text-muted-foreground">
          Planejamento para {format(now, 'MMMM yyyy', { locale: ptBR })}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Receita Prevista
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {formatCurrency(plannedIncome)}
            </div>
            <p className="text-xs text-muted-foreground">
              Baseado no salário base
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Despesas Planejadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600">
              {formatCurrency(totalPlannedExpenses)}
            </div>
            <p className="text-xs text-muted-foreground">
              Soma dos limites das categorias
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Saldo Projetado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${plannedBalance >= 0 ? 'text-blue-600' : 'text-rose-600'}`}
            >
              {formatCurrency(plannedBalance)}
            </div>
            <p className="text-xs text-muted-foreground">
              Ao final do mês (se seguir o plano)
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalhamento por Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Categoria</TableHead>
                <TableHead className="text-right">Limite Definido</TableHead>
                <TableHead className="text-right">Gasto Atual</TableHead>
                <TableHead className="text-right">Disponível</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenseCategories.map((cat) => (
                <TableRow key={cat.id}>
                  <TableCell className="font-medium">{cat.name}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(cat.limit)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(cat.spent)}
                  </TableCell>
                  <TableCell
                    className={`text-right font-semibold ${cat.remaining < 0 ? 'text-rose-600' : 'text-emerald-600'}`}
                  >
                    {formatCurrency(cat.remaining)}
                  </TableCell>
                  <TableCell className="text-center">
                    {cat.spent > cat.limit ? (
                      <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700">
                        Estourado
                      </span>
                    ) : cat.spent > cat.limit * 0.8 ? (
                      <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
                        Alerta
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                        OK
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
