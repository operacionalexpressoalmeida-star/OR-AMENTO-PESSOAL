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
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { useState } from 'react'
import { toast } from '@/hooks/use-toast'
import { Download, Upload } from 'lucide-react'

export default function Configuracoes() {
  const { settings, updateSettings, user, updateUser } = useFinance()
  const [alertThreshold, setAlertThreshold] = useState(settings.alertThreshold)

  const handleSave = () => {
    updateSettings({ alertThreshold })
    toast({ title: 'Configurações salvas' })
  }

  const exportData = () => {
    const data = localStorage.getItem('orcamento_pessoal_data')
    if (!data) return
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `backup_orcamento_${new Date().toISOString().split('T')[0]}.json`
    a.click()
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Configurações</h2>
        <p className="text-muted-foreground">
          Preferências do sistema e dados.
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Alertas e Limites</CardTitle>
            <CardDescription>
              Defina quando você quer ser avisado sobre seus gastos.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between">
                <Label>Limite de Alerta Percentual</Label>
                <span className="font-bold">{alertThreshold}%</span>
              </div>
              <Slider
                value={[alertThreshold]}
                onValueChange={(vals) => setAlertThreshold(vals[0])}
                max={100}
                step={5}
              />
              <p className="text-xs text-muted-foreground">
                Você receberá um alerta visual quando uma categoria atingir{' '}
                {alertThreshold}% do limite definido.
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSave}>Salvar Preferências</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dados e Backup</CardTitle>
            <CardDescription>Gerencie seus dados locais.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between border p-4 rounded-lg">
              <div className="space-y-1">
                <p className="font-medium">Exportar Dados</p>
                <p className="text-sm text-muted-foreground">
                  Baixe uma cópia dos seus dados em JSON.
                </p>
              </div>
              <Button variant="outline" onClick={exportData}>
                <Download className="mr-2 h-4 w-4" /> Exportar
              </Button>
            </div>

            {/* Import feature would go here */}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
