import { useFinance } from '@/context/FinanceContext'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useState } from 'react'
import { toast } from '@/hooks/use-toast'
import { User } from 'lucide-react'

export default function PerfilUsuario() {
  const { user, updateUser } = useFinance()
  const [formData, setFormData] = useState({
    name: user.name,
    profileType: user.profileType,
    currency: user.currency,
    baseSalary: user.baseSalary,
  })

  const handleChange = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = () => {
    updateUser({
      ...formData,
      baseSalary: Number(formData.baseSalary),
    })
    toast({ title: 'Perfil atualizado com sucesso!' })
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Meu Perfil</h2>
        <p className="text-muted-foreground">
          Gerencie suas informações pessoais.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div>
              <CardTitle>{formData.name}</CardTitle>
              <CardDescription>
                {formData.profileType === 'individual'
                  ? 'Perfil Individual'
                  : 'Perfil Familiar'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Nome Completo</Label>
            <Input
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo de Perfil</Label>
              <Select
                value={formData.profileType}
                onValueChange={(v) => handleChange('profileType', v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Individual</SelectItem>
                  <SelectItem value="family">Familiar</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Moeda Principal</Label>
              <Select
                value={formData.currency}
                onValueChange={(v) => handleChange('currency', v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BRL">Real (R$)</SelectItem>
                  <SelectItem value="USD">Dólar ($)</SelectItem>
                  <SelectItem value="EUR">Euro (€)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Renda Base Mensal (Estimada)</Label>
            <Input
              type="number"
              value={formData.baseSalary}
              onChange={(e) => handleChange('baseSalary', e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Usado para cálculo automático do orçamento mensal.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={handleSave}>Salvar Alterações</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
