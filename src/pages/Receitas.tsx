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

export default function Receitas() {
  const { transactions, categories, user, deleteTransaction } = useFinance()
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const incomes = transactions
    .filter((t) => t.type === 'income')
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Receitas</h2>
          <p className="text-muted-foreground">
            Gerencie suas fontes de renda.
          </p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          <Plus className="mr-2 h-4 w-4" /> Nova Receita
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar receitas..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {/* Future: Add more filters here */}
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
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {incomes.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-muted-foreground"
                    >
                      Nenhuma receita encontrada.
                    </TableCell>
                  </TableRow>
                ) : (
                  incomes.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell>
                        {format(parseISO(t.date), 'dd/MM/yyyy')}
                      </TableCell>
                      <TableCell className="font-medium">
                        {t.description}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                          {categories.find((c) => c.id === t.categoryId)
                            ?.name || 'Sem categoria'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset',
                            t.status === 'completed'
                              ? 'bg-green-50 text-green-700 ring-green-600/20'
                              : 'bg-yellow-50 text-yellow-800 ring-yellow-600/20',
                          )}
                        >
                          {t.status === 'completed' ? 'Recebido' : 'Pendente'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right text-emerald-600 font-semibold">
                        {formatCurrency(t.amount)}
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
        type="income"
      />
    </div>
  )
}
