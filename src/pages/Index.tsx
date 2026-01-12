import { useFinance } from '@/context/FinanceContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  format,
  startOfMonth,
  endOfMonth,
  isWithinInterval,
  parseISO,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  CircleArrowUp,
  CircleArrowDown,
  Wallet,
  PiggyBank,
  TriangleAlert,
  Pencil,
} from 'lucide-react'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function Dashboard() {
  const { transactions, user, categories } = useFinance()

  const now = new Date()
  const currentMonthStart = startOfMonth(now)
  const currentMonthEnd = endOfMonth(now)

  // Filter current month transactions
  const currentMonthTransactions = transactions.filter((t) => {
    const date = parseISO(t.date)
    return (
      isWithinInterval(date, {
        start: currentMonthStart,
        end: currentMonthEnd,
      }) && t.status === 'completed'
    )
  })

  // Calculate indicators
  const totalIncome = currentMonthTransactions
    .filter((t) => t.type === 'income')
    .reduce((acc, curr) => acc + curr.amount, 0)

  const totalExpense = currentMonthTransactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, curr) => acc + curr.amount, 0)

  const balance = totalIncome - totalExpense
  const savingsRate =
    totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: user.currency,
    }).format(value)
  }

  // Greetings
  const hour = now.getHours()
  let greeting = 'Bom dia'
  if (hour >= 12) greeting = 'Boa tarde'
  if (hour >= 18) greeting = 'Boa noite'

  // Prepare Chart Data: Monthly Evolution (Last 6 months)
  // Simplified for this example, usually would need complex date grouping
  const monthlyData = [
    { name: 'Mês 1', income: totalIncome * 0.8, expense: totalExpense * 0.9 },
    { name: 'Mês 2', income: totalIncome * 0.9, expense: totalExpense * 1.1 },
    { name: 'Atual', income: totalIncome, expense: totalExpense },
  ]

  const chartConfig = {
    income: {
      label: 'Receitas',
      color: 'hsl(var(--chart-2))',
    },
    expense: {
      label: 'Despesas',
      color: 'hsl(var(--chart-1))',
    },
  } satisfies ChartConfig

  // Budget Alerts
  const alerts = categories
    .filter((c) => c.type === 'expense' && c.monthlyLimit)
    .map((cat) => {
      const spent = currentMonthTransactions
        .filter((t) => t.categoryId === cat.id)
        .reduce((acc, curr) => acc + curr.amount, 0)
      const limit = cat.monthlyLimit || 0
      const percentage = (spent / limit) * 100
      return { ...cat, spent, percentage }
    })
    .filter((item) => item.percentage >= 80)

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            {greeting}, {user.name.split(' ')[0]}!
          </h2>
          <p className="text-muted-foreground">
            Aqui está o resumo financeiro de{' '}
            {format(now, 'MMMM', { locale: ptBR })}.
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/receitas">
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              Nova Receita
            </Button>
          </Link>
          <Link to="/despesas">
            <Button variant="destructive">Nova Despesa</Button>
          </Link>
        </div>
      </div>

      {/* Indicators */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-subtle hover:shadow-elevation transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Atual</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={cn(
                'text-2xl font-bold',
                balance >= 0 ? 'text-emerald-600' : 'text-rose-600',
              )}
            >
              {formatCurrency(balance)}
            </div>
            <p className="text-xs text-muted-foreground">
              {balance >= 0 ? 'Positivo' : 'Negativo'} neste mês
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-subtle hover:shadow-elevation transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Receitas
            </CardTitle>
            <CircleArrowUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {formatCurrency(totalIncome)}
            </div>
            <p className="text-xs text-muted-foreground">
              +0% em relação ao mês anterior
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-subtle hover:shadow-elevation transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Despesas
            </CardTitle>
            <CircleArrowDown className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600">
              {formatCurrency(totalExpense)}
            </div>
            <p className="text-xs text-muted-foreground">
              Controle seus gastos
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-subtle hover:shadow-elevation transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Taxa de Economia
            </CardTitle>
            <PiggyBank className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {savingsRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Meta recomendada: 20%
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Charts */}
        <Card className="col-span-4 shadow-subtle">
          <CardHeader>
            <CardTitle>Evolução Mensal</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <BarChart data={monthlyData}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar
                  dataKey="income"
                  fill="var(--color-income)"
                  radius={[4, 4, 0, 0]}
                  name="Receitas"
                />
                <Bar
                  dataKey="expense"
                  fill="var(--color-expense)"
                  radius={[4, 4, 0, 0]}
                  name="Despesas"
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Alerts and Categories */}
        <div className="col-span-3 space-y-4">
          <Card className="shadow-subtle h-full">
            <CardHeader>
              <CardTitle>Alertas de Orçamento</CardTitle>
            </CardHeader>
            <CardContent>
              {alerts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum alerta. Você está dentro do orçamento! 🎉
                </div>
              ) : (
                <div className="space-y-4">
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="flex items-center space-x-4 border p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20"
                    >
                      <TriangleAlert
                        className={cn(
                          'h-5 w-5',
                          alert.percentage >= 100
                            ? 'text-rose-600'
                            : 'text-amber-600',
                        )}
                      />
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {alert.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(alert.spent)} de{' '}
                          {formatCurrency(alert.monthlyLimit || 0)}
                        </p>
                      </div>
                      <div
                        className={cn(
                          'font-bold text-sm',
                          alert.percentage >= 100
                            ? 'text-rose-600'
                            : 'text-amber-600',
                        )}
                      >
                        {alert.percentage.toFixed(0)}%
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Transactions */}
      <Card className="shadow-subtle">
        <CardHeader>
          <CardTitle>Transações Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              Nenhuma transação encontrada. Adicione sua primeira receita ou
              despesa.
            </div>
          ) : (
            <div className="space-y-4">
              {transactions
                .slice()
                .sort(
                  (a, b) =>
                    new Date(b.date).getTime() - new Date(a.date).getTime(),
                )
                .slice(0, 5)
                .map((t) => {
                  const category = categories.find((c) => c.id === t.categoryId)
                  return (
                    <div
                      key={t.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={cn(
                            'p-2 rounded-full',
                            t.type === 'income'
                              ? 'bg-emerald-100 text-emerald-600'
                              : 'bg-rose-100 text-rose-600',
                          )}
                        >
                          {t.type === 'income' ? (
                            <CircleArrowUp size={20} />
                          ) : (
                            <CircleArrowDown size={20} />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{t.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(parseISO(t.date), 'dd/MM/yyyy')} •{' '}
                            {category?.name}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span
                          className={cn(
                            'font-semibold tabular-nums',
                            t.type === 'income'
                              ? 'text-emerald-600'
                              : 'text-rose-600',
                          )}
                        >
                          {t.type === 'income' ? '+' : '-'}
                          {formatCurrency(t.amount)}
                        </span>
                        <Button variant="ghost" size="icon">
                          <Pencil className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
