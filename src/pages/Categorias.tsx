import { useState } from 'react'
import { useFinance } from '@/context/FinanceContext'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Plus, Tags } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from '@/hooks/use-toast'

export default function Categorias() {
  const { categories, transactions, addCategory, user } = useFinance()
  const [isModalOpen, setIsModalOpen] = useState(false)

  // New Category State
  const [newCatName, setNewCatName] = useState('')
  const [newCatType, setNewCatType] = useState('expense')
  const [newCatLimit, setNewCatLimit] = useState('')

  const handleAddCategory = () => {
    if (!newCatName) return
    addCategory({
      name: newCatName,
      type: newCatType as any,
      monthlyLimit:
        newCatType === 'expense' && newCatLimit
          ? Number(newCatLimit)
          : undefined,
      status: 'active',
      color: '#' + Math.floor(Math.random() * 16777215).toString(16), // Random color
    })
    setNewCatName('')
    setNewCatLimit('')
    setIsModalOpen(false)
    toast({ title: 'Categoria criada com sucesso!' })
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: user.currency,
    }).format(value)
  }

  const currentMonth = new Date().toISOString().substring(0, 7) // YYYY-MM

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
      const percentage = limit > 0 ? (spent / limit) * 100 : 0
      return { ...c, spent, percentage }
    })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Categorias</h2>
          <p className="text-muted-foreground">
            Gerencie categorias e limites de gastos.
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Nova Categoria
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {expenseCategories.map((cat) => (
          <Card key={cat.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Tags className="h-4 w-4 text-muted-foreground" />
                    {cat.name}
                  </CardTitle>
                  <CardDescription>
                    Limite:{' '}
                    {cat.monthlyLimit
                      ? formatCurrency(cat.monthlyLimit)
                      : 'Sem limite'}
                  </CardDescription>
                </div>
                <div
                  className={`text-xl font-bold ${cat.spent > (cat.monthlyLimit || 0) ? 'text-rose-600' : 'text-emerald-600'}`}
                >
                  {formatCurrency(cat.spent)}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Progresso mensal</span>
                  <span>{cat.percentage.toFixed(0)}%</span>
                </div>
                <Progress
                  value={Math.min(cat.percentage, 100)}
                  className={`h-2 ${cat.percentage > 100 ? '[&>div]:bg-rose-500' : cat.percentage > 80 ? '[&>div]:bg-amber-500' : '[&>div]:bg-emerald-500'}`}
                />
                {cat.percentage > 100 && (
                  <p className="text-xs text-rose-600 font-medium pt-1">
                    Limite excedido!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Income Categories (Simpler View) */}
        <Card className="col-span-full">
          <CardHeader>
            <CardTitle>Categorias de Receita</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {categories
                .filter((c) => c.type === 'income')
                .map((c) => (
                  <div
                    key={c.id}
                    className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium"
                  >
                    {c.name}
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Categoria</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="Ex: Educação"
              />
            </div>
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={newCatType} onValueChange={setNewCatType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Receita</SelectItem>
                  <SelectItem value="expense">Despesa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {newCatType === 'expense' && (
              <div className="space-y-2">
                <Label>Limite Mensal (Opcional)</Label>
                <Input
                  type="number"
                  value={newCatLimit}
                  onChange={(e) => setNewCatLimit(e.target.value)}
                  placeholder="0.00"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={handleAddCategory}>Criar Categoria</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
