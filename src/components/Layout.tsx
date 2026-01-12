import { Outlet, Link, useLocation } from 'react-router-dom'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarFooter,
} from '@/components/ui/sidebar'
import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  Tags,
  Target,
  Calendar,
  ChartBar,
  Settings,
  Plus,
  Eye,
  EyeOff,
  User as UserIcon,
} from 'lucide-react'
import { useState } from 'react'
import { useFinance } from '@/context/FinanceContext'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

export default function Layout() {
  const location = useLocation()
  const { user, transactions } = useFinance()
  const [showBalance, setShowBalance] = useState(true)

  // Calculate current balance
  const balance = transactions.reduce((acc, curr) => {
    if (curr.status === 'completed') {
      return curr.type === 'income' ? acc + curr.amount : acc - curr.amount
    }
    return acc
  }, 0)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: user.currency,
    }).format(value)
  }

  const menuItems = [
    { title: 'Dashboard', url: '/', icon: LayoutDashboard },
    { title: 'Receitas', url: '/receitas', icon: TrendingUp },
    { title: 'Despesas', url: '/despesas', icon: TrendingDown },
    { title: 'Categorias', url: '/categorias', icon: Tags },
    { title: 'Metas', url: '/metas', icon: Target },
    { title: 'Orçamento', url: '/orcamento', icon: Calendar },
    { title: 'Relatórios', url: '/relatorios', icon: ChartBar },
    { title: 'Configurações', url: '/configuracoes', icon: Settings },
  ]

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar>
          <SidebarHeader className="border-b px-6 py-4">
            <h1 className="text-xl font-bold text-primary flex items-center gap-2">
              <span className="bg-primary text-primary-foreground p-1 rounded-md">
                OP
              </span>
              Orçamento
            </h1>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={location.pathname === item.url}
                        className="w-full"
                      >
                        <Link to={item.url} className="flex items-center gap-3">
                          <item.icon className="h-5 w-5" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="border-t p-4">
            <Link to="/despesas">
              <Button className="w-full justify-start gap-2" variant="outline">
                <Plus className="h-4 w-4" />
                Adicionar Transação
              </Button>
            </Link>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out">
          {/* Header */}
          <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur px-6 shadow-sm">
            <SidebarTrigger />

            <div className="flex-1 font-semibold text-lg text-foreground/80">
              {menuItems.find((i) => i.url === location.pathname)?.title ||
                'Dashboard'}
            </div>

            <div className="flex items-center gap-6">
              <div className="hidden md:flex flex-col items-end">
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                  Saldo Atual
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'font-mono text-lg font-bold transition-all',
                      balance >= 0 ? 'text-emerald-600' : 'text-rose-600',
                    )}
                  >
                    {showBalance ? formatCurrency(balance) : '••••••'}
                  </span>
                  <button
                    onClick={() => setShowBalance(!showBalance)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showBalance ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="h-8 w-px bg-border hidden md:block" />

              <Link
                to="/perfil"
                className="flex items-center gap-3 hover:bg-muted/50 p-2 rounded-lg transition-colors"
              >
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-medium leading-none">
                    {user.name}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 capitalize">
                    {user.profileType}
                  </div>
                </div>
                <Avatar>
                  <AvatarImage
                    src={`https://img.usecurling.com/ppl/thumbnail?gender=male&seed=user`}
                  />
                  <AvatarFallback>
                    <UserIcon className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              </Link>
            </div>
          </header>

          <div className="flex-1 overflow-auto p-4 md:p-8 bg-muted/20">
            <div className="mx-auto max-w-7xl animate-fade-in">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
