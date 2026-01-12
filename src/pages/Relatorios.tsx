import { useFinance } from '@/context/FinanceContext'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/components/ui/chart'
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  LabelList,
} from 'recharts'
import {
  format,
  startOfMonth,
  endOfMonth,
  isWithinInterval,
  parseISO,
  subMonths,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { TrendingUp, TrendingDown, Target, Wallet } from 'lucide-react'

export default function Relatorios() {
  const { transactions, categories, goals, user } = useFinance()
  const now = new Date()

  // --- 1. Data Preparation: Despesas por Categoria (Pie Chart) ---
  const currentMonthStart = startOfMonth(now)
  const currentMonthEnd = endOfMonth(now)

  const currentMonthExpenses = transactions.filter((t) => {
    const date = parseISO(t.date)
    return (
      t.type === 'expense' &&
      isWithinInterval(date, { start: currentMonthStart, end: currentMonthEnd })
    )
  })

  // Group by Category
  const expenseByCategoryMap = currentMonthExpenses.reduce(
    (acc, t) => {
      const cat = categories.find((c) => c.id === t.categoryId)
      const name = cat?.name || 'Outros'
      const color = cat?.color || 'hsl(var(--muted))'

      if (!acc[name]) {
        acc[name] = { name, value: 0, fill: color }
      }
      acc[name].value += t.amount
      return acc
    },
    {} as Record<string, { name: string; value: number; fill: string }>,
  )

  const expensePieData = Object.values(expenseByCategoryMap).filter(
    (d) => d.value > 0,
  )

  // Dynamic Config for Pie Chart
  const pieChartConfig: ChartConfig = {
    expenses: { label: 'Despesas' },
    ...categories.reduce(
      (acc, c) => ({
        ...acc,
        [c.name]: { label: c.name, color: c.color },
      }),
      {},
    ),
  }

  // --- 2. Data Preparation: Previsto vs Realizado (Bar Chart) ---
  // Filter categories that have a monthly limit defined
  const budgetData = categories
    .filter((c) => c.type === 'expense' && (c.monthlyLimit || 0) > 0)
    .map((c) => {
      const spent = currentMonthExpenses
        .filter((t) => t.categoryId === c.id)
        .reduce((acc, t) => acc + t.amount, 0)
      return {
        category: c.name,
        planned: c.monthlyLimit || 0,
        actual: spent,
      }
    })
    .sort((a, b) => b.planned - a.planned)
    .slice(0, 6) // Top 6 for readability

  const budgetConfig: ChartConfig = {
    planned: {
      label: 'Previsto',
      color: 'hsl(var(--muted))',
    },
    actual: {
      label: 'Realizado',
      color: 'hsl(var(--primary))',
    },
  }

  // --- 3. Data Preparation: Evolução Mensal (Line Chart) ---
  const last6Months = Array.from({ length: 6 }).map((_, i) => {
    const date = subMonths(now, 5 - i)
    return {
      date,
      monthStr: format(date, 'yyyy-MM'),
      label: format(date, 'MMM', { locale: ptBR }),
    }
  })

  const evolutionData = last6Months.map((m) => {
    const monthTrans = transactions.filter((t) => t.date.startsWith(m.monthStr))
    const income = monthTrans
      .filter((t) => t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0)
    const expense = monthTrans
      .filter((t) => t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0)

    return {
      month: m.label,
      income,
      expense,
      balance: income - expense,
    }
  })

  const evolutionConfig: ChartConfig = {
    income: {
      label: 'Receitas',
      color: 'hsl(var(--emerald-500))', // Using tailwind colors mapped in CSS or direct
    },
    expense: {
      label: 'Despesas',
      color: 'hsl(var(--rose-500))',
    },
    balance: {
      label: 'Saldo',
      color: 'hsl(var(--primary))',
    },
  }

  // --- 4. Data Preparation: Metas Financeiras (Bar Chart Horizontal) ---
  const goalsData = goals.map((g) => ({
    name: g.name,
    current: g.currentValue,
    target: g.targetValue,
    percentage: Math.min(100, (g.currentValue / g.targetValue) * 100),
  }))

  const goalsConfig: ChartConfig = {
    current: {
      label: 'Atual',
      color: 'hsl(var(--blue-500))',
    },
    target: {
      label: 'Alvo',
      color: 'hsl(var(--muted))',
    },
  }

  // --- Indicators ---
  const totalIncome = evolutionData[evolutionData.length - 1]?.income || 0
  const totalExpense = evolutionData[evolutionData.length - 1]?.expense || 0
  const savingsRate =
    totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: user.currency,
    }).format(value)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          Relatórios Financeiros
        </h2>
        <p className="text-muted-foreground">
          Análise completa do seu desempenho financeiro e metas.
        </p>
      </div>

      {/* Indicators Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Economia Mensal
            </CardTitle>
            <Wallet className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{savingsRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Da renda mensal</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Receita Mês Atual
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalIncome)}
            </div>
            <p className="text-xs text-muted-foreground">
              {evolutionData[evolutionData.length - 1]?.month}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Despesa Mês Atual
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalExpense)}
            </div>
            <p className="text-xs text-muted-foreground">
              {evolutionData[evolutionData.length - 1]?.month}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Metas Ativas</CardTitle>
            <Target className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{goals.length}</div>
            <p className="text-xs text-muted-foreground">Em andamento</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* 1. Despesas por Categoria */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Despesas por Categoria</CardTitle>
            <CardDescription>
              Distribuição dos gastos no mês atual
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            {expensePieData.length > 0 ? (
              <ChartContainer
                config={pieChartConfig}
                className="mx-auto aspect-square max-h-[300px]"
              >
                <PieChart>
                  <Pie
                    data={expensePieData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={90}
                    strokeWidth={5}
                  >
                    {expensePieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                    <LabelList
                      dataKey="name"
                      className="fill-background"
                      stroke="none"
                      fontSize={12}
                      formatter={(value: keyof typeof pieChartConfig) =>
                        pieChartConfig[value]?.label
                      }
                    />
                  </Pie>
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                </PieChart>
              </ChartContainer>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                Sem dados de despesas este mês
              </div>
            )}
          </CardContent>
        </Card>

        {/* 2. Previsto vs Realizado */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Previsto vs. Realizado</CardTitle>
            <CardDescription>
              Comparativo de orçamento das principais categorias
            </CardDescription>
          </CardHeader>
          <CardContent>
            {budgetData.length > 0 ? (
              <ChartContainer
                config={budgetConfig}
                className="h-[300px] w-full"
              >
                <BarChart
                  accessibilityLayer
                  data={budgetData}
                  layout="vertical"
                  margin={{ left: 0 }}
                >
                  <CartesianGrid horizontal={false} />
                  <YAxis
                    dataKey="category"
                    type="category"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    hide={false}
                    width={100}
                  />
                  <XAxis type="number" hide />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dashed" />}
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar
                    dataKey="planned"
                    fill="var(--color-planned)"
                    radius={[0, 4, 4, 0]}
                    barSize={20}
                  />
                  <Bar
                    dataKey="actual"
                    fill="var(--color-actual)"
                    radius={[0, 4, 4, 0]}
                    barSize={20}
                  />
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                Defina limites nas categorias para ver este gráfico
              </div>
            )}
          </CardContent>
        </Card>

        {/* 3. Evolução Mensal */}
        <Card className="col-span-full lg:col-span-1">
          <CardHeader>
            <CardTitle>Evolução Mensal</CardTitle>
            <CardDescription>
              Histórico de receitas, despesas e saldo (Últimos 6 meses)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={evolutionConfig}
              className="h-[300px] w-full"
            >
              <LineChart
                accessibilityLayer
                data={evolutionData}
                margin={{
                  left: 12,
                  right: 12,
                }}
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent />}
                />
                <ChartLegend content={<ChartLegendContent />} />
                <Line
                  dataKey="income"
                  type="monotone"
                  stroke="var(--color-income)" // Using variable from config
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  dataKey="expense"
                  type="monotone"
                  stroke="var(--color-expense)"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  dataKey="balance"
                  type="monotone"
                  stroke="var(--color-balance)"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* 4. Metas Financeiras */}
        <Card className="col-span-full lg:col-span-1">
          <CardHeader>
            <CardTitle>Metas Financeiras</CardTitle>
            <CardDescription>
              Progresso atual dos seus objetivos
            </CardDescription>
          </CardHeader>
          <CardContent>
            {goalsData.length > 0 ? (
              <ChartContainer config={goalsConfig} className="h-[300px] w-full">
                <BarChart
                  accessibilityLayer
                  data={goalsData}
                  layout="vertical"
                  margin={{
                    left: 20,
                  }}
                >
                  <YAxis
                    dataKey="name"
                    type="category"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    width={100}
                  />
                  <XAxis type="number" hide />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent />}
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar
                    dataKey="target"
                    fill="var(--color-target)"
                    radius={[0, 4, 4, 0]}
                    stackId="a"
                    barSize={30}
                    className="opacity-30"
                  />
                  <Bar
                    dataKey="current"
                    fill="var(--color-current)"
                    radius={[0, 4, 4, 0]}
                    barSize={30}
                    className="absolute top-0"
                  />
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                Nenhuma meta cadastrada
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
