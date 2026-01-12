import { useState } from 'react'
import { useFinance } from '@/context/FinanceContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Plus, Search, Filter } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { TransactionForm } from '@/components/TransactionForm'
import { cn } from '@/lib/utils'

export default function Despesas() {
  const { transactions, categories, user, deleteTransaction } = useFinance()
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const expenses = transactions
    .filter((t) => t.type === 'expense')
    .filter((t) =>
      t.description.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: user.currency,
    }).format(value)
  }

  const getPaymentMethodLabel = (method?: string) => {
    const map: Record<string, string> = {
      money: 'Dinheiro',
      debit: 'Débito',
      credit: 'Crédito',
      pix: 'PIX',
    }
    return method ? map[method] || method : '-'
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Despesas</h2>
          <p className="text-muted-foreground">
            Controle seus gastos e pagamentos.
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} variant="destructive">
          <Plus className="mr-2 h-4 w-4" /> Nova Despesa
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar despesas..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Pagamento</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-muted-foreground"
                    >
                      Nenhuma despesa encontrada.
                    </TableCell>
                  </TableRow>
                ) : (
                  expenses.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell>
                        {format(parseISO(t.date), 'dd/MM/yyyy')}
                      </TableCell>
                      <TableCell className="font-medium">
                        {t.description}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                          {categories.find((c) => c.id === t.categoryId)
                            ?.name || 'Sem categoria'}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {getPaymentMethodLabel(t.paymentMethod)}
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset',
                            t.status === 'completed'
                              ? 'bg-red-50 text-red-700 ring-red-600/10'
                              : 'bg-yellow-50 text-yellow-800 ring-yellow-600/20',
                          )}
                        >
                          {t.status === 'completed' ? 'Pago' : 'Pendente'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right text-rose-600 font-semibold">
                        -{formatCurrency(t.amount)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteTransaction(t.id)}
                          className="text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                        >
                          Excluir
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <TransactionForm
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        type="expense"
      />
    </div>
  )
}
