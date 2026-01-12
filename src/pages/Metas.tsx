import { useState } from 'react'
import { useFinance } from '@/context/FinanceContext'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Target, Trophy } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { format, parseISO } from 'date-fns'
import { toast } from '@/hooks/use-toast'

export default function Metas() {
  const { goals, addGoal, user, updateGoal } = useFinance()
  const [isModalOpen, setIsModalOpen] = useState(false)

  // New Goal State
  const [name, setName] = useState('')
  const [target, setTarget] = useState('')
  const [current, setCurrent] = useState('0')
  const [deadline, setDeadline] = useState('')

  const handleAddGoal = () => {
    if (!name || !target || !deadline) return
    addGoal({
      name,
      targetValue: Number(target),
      currentValue: Number(current),
      monthlyPlannedValue: 0, // Simplified for now
      deadline,
      status: 'in_progress',
    })
    setIsModalOpen(false)
    setName('')
    setTarget('')
    setDeadline('')
    toast({ title: 'Meta criada com sucesso!' })
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: user.currency,
    }).format(value)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Metas Financeiras
          </h2>
          <p className="text-muted-foreground">
            Defina e acompanhe seus objetivos de longo prazo.
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Nova Meta
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {goals.map((goal) => {
          const progress = (goal.currentValue / goal.targetValue) * 100
          return (
            <Card
              key={goal.id}
              className="relative overflow-hidden group hover:shadow-elevation transition-all"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{goal.name}</CardTitle>
                  <Target className="h-5 w-5 text-indigo-500" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Prazo: {format(parseISO(goal.deadline), 'dd/MM/yyyy')}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-sm text-muted-foreground">Atual</p>
                    <p className="text-2xl font-bold text-indigo-600">
                      {formatCurrency(goal.currentValue)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Alvo</p>
                    <p className="text-lg font-semibold">
                      {formatCurrency(goal.targetValue)}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Progress value={progress} className="h-3" />
                  <p className="text-right text-xs font-medium text-muted-foreground">
                    {progress.toFixed(1)}% concluído
                  </p>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/50 p-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    // Quick update simulation
                    const increment = 100
                    updateGoal(goal.id, {
                      currentValue: goal.currentValue + increment,
                    })
                    toast({
                      title: `Adicionado ${formatCurrency(increment)} para ${goal.name}`,
                    })
                  }}
                >
                  Adicionar + {formatCurrency(100)}
                </Button>
              </CardFooter>
            </Card>
          )
        })}

        {goals.length === 0 && (
          <Card className="flex flex-col items-center justify-center p-8 border-dashed">
            <Trophy className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
            <p className="text-muted-foreground text-center">
              Nenhuma meta definida ainda.
            </p>
          </Card>
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Meta</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome da Meta</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Viagem Europa"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Valor Alvo</Label>
                <Input
                  type="number"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label>Valor Inicial</Label>
                <Input
                  type="number"
                  value={current}
                  onChange={(e) => setCurrent(e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Prazo</Label>
              <Input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleAddGoal}>Criar Meta</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
