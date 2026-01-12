import { useFinance } from '@/context/FinanceContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts'

export default function Relatorios() {
  const { transactions, categories } = useFinance()

  // Prepare data for "Expenses by Category" (All time)
  const expenseData = categories
    .filter((c) => c.type === 'expense')
    .map((c) => {
      const total = transactions
        .filter((t) => t.categoryId === c.id && t.type === 'expense')
        .reduce((acc, t) => acc + t.amount, 0)
      return { name: c.name, value: total, fill: c.color || '#8884d8' }
    })
    .filter((d) => d.value > 0)

  // Prepare data for "Income vs Expense" (Monthly) - Simplified aggregation
  // In a real app, we would group by month properly
  const monthlyAgg = transactions.reduce(
    (acc, t) => {
      const month = t.date.substring(0, 7) // YYYY-MM
      if (!acc[month]) acc[month] = { month, income: 0, expense: 0 }
      if (t.type === 'income') acc[month].income += t.amount
      else acc[month].expense += t.amount
      return acc
    },
    {} as Record<string, any>,
  )

  const monthlyData = Object.values(monthlyAgg).sort((a: any, b: any) =>
    a.month.localeCompare(b.month),
  )

  const chartConfig = {
    income: { label: 'Receitas', color: 'hsl(var(--chart-2))' },
    expense: { label: 'Despesas', color: 'hsl(var(--chart-1))' },
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Relatórios</h2>
        <p className="text-muted-foreground">
          Análise detalhada das suas finanças.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Despesas por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full flex justify-center">
              <PieChart width={300} height={300}>
                <Pie
                  data={expenseData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {expenseData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </div>
            <div className="flex flex-wrap gap-2 justify-center mt-4">
              {expenseData.map((d, i) => (
                <div key={i} className="flex items-center gap-1 text-xs">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: d.fill }}
                  />
                  <span>{d.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Receitas vs Despesas (Histórico)</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <BarChart data={monthlyData}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="month" />
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

        <Card className="col-span-full">
          <CardHeader>
            <CardTitle>Evolução do Saldo Acumulado</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                balance: { label: 'Saldo', color: 'hsl(var(--primary))' },
              }}
              className="h-[300px] w-full"
            >
              <LineChart
                data={monthlyData.map((d: any) => ({
                  ...d,
                  balance: d.income - d.expense,
                }))}
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="balance"
                  stroke="var(--color-balance)"
                  strokeWidth={2}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
