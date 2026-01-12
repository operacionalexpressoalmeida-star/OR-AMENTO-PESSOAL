import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useFinance } from '@/context/FinanceContext'
import { TransactionType } from '@/types'
import { toast } from '@/hooks/use-toast'

const formSchema = z.object({
  description: z.string().min(2, 'Descrição é obrigatória'),
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: 'Valor deve ser positivo',
  }),
  categoryId: z.string().min(1, 'Categoria é obrigatória'),
  date: z.string().min(1, 'Data é obrigatória'),
  paymentMethod: z.string().optional(),
  status: z.enum(['pending', 'completed']),
})

interface TransactionFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  type: TransactionType
}

export function TransactionForm({
  open,
  onOpenChange,
  type,
}: TransactionFormProps) {
  const { categories, addTransaction, transactions } = useFinance()
  const [loading, setLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: '',
      amount: '',
      categoryId: '',
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'money',
      status: 'completed',
    },
  })

  const availableCategories = categories.filter(
    (c) => c.type === type && c.status === 'active',
  )

  function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true)

    const amount = Number(values.amount)

    // Business Rule: Check budget limit for expenses
    if (type === 'expense') {
      const category = categories.find((c) => c.id === values.categoryId)
      if (category && category.monthlyLimit) {
        const currentMonth = values.date.substring(0, 7) // YYYY-MM
        const spentThisMonth = transactions
          .filter(
            (t) =>
              t.categoryId === values.categoryId &&
              t.type === 'expense' &&
              t.date.startsWith(currentMonth),
          )
          .reduce((acc, t) => acc + t.amount, 0)

        if (spentThisMonth + amount > category.monthlyLimit) {
          toast({
            title: 'Atenção: Limite Excedido',
            description: `Esta despesa excede o limite mensal da categoria ${category.name}.`,
            variant: 'destructive',
          })
        }
      }
    }

    addTransaction({
      description: values.description,
      amount: amount,
      categoryId: values.categoryId,
      date: values.date,
      type: type,
      status: values.status as any,
      paymentMethod: values.paymentMethod as any,
    })

    toast({
      title: 'Sucesso',
      description: `${type === 'income' ? 'Receita' : 'Despesa'} adicionada com sucesso!`,
    })

    setLoading(false)
    form.reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {type === 'income' ? 'Nova Receita' : 'Nova Despesa'}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Compras Supermercado" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor (R$)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableCategories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {type === 'expense' && (
              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Forma de Pagamento</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="money">Dinheiro</SelectItem>
                        <SelectItem value="debit">Débito</SelectItem>
                        <SelectItem value="credit">Crédito</SelectItem>
                        <SelectItem value="pix">PIX</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <DialogFooter>
              <Button type="submit" disabled={loading}>
                {loading ? 'Salvando...' : 'Salvar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
