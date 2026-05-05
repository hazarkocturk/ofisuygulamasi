import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckSquare, FolderKanban, Users, Clock } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const greeting = user?.user_metadata?.full_name
    ? `Merhaba, ${(user.user_metadata.full_name as string).split(' ')[0]}`
    : 'Merhaba'

  const stats = [
    { title: 'Aktif Görevler', value: '0', icon: CheckSquare, description: 'Devam eden görevler' },
    { title: 'Projeler', value: '0', icon: FolderKanban, description: 'Aktif projeler' },
    { title: 'Ekip Üyeleri', value: '0', icon: Users, description: 'Toplam üye' },
    { title: 'Bu Hafta', value: '0', icon: Clock, description: 'Tamamlanan görev' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">{greeting}</h1>
        <p className="text-sm text-neutral-500 mt-0.5">İşte bugünkü özetin</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ title, value, icon: Icon, description }) => (
          <Card key={title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-neutral-500">{title}</CardTitle>
              <Icon className="h-4 w-4 text-neutral-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{value}</div>
              <p className="text-xs text-neutral-500 mt-1">{description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
