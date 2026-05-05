import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Building2, Mail } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const greeting = user?.user_metadata?.full_name
    ? `Merhaba, ${(user.user_metadata.full_name as string).split(' ')[0]}`
    : 'Merhaba'

  const { data: member } = await supabase
    .from('office_members')
    .select('office_id, role')
    .eq('user_id', user?.id ?? '')
    .maybeSingle()

  const officeId = member?.office_id

  const [officeRes, membersRes, deptsRes, pendingInvitesRes] = await Promise.all([
    officeId
      ? supabase.from('offices').select('name').eq('id', officeId).single()
      : Promise.resolve({ data: null }),
    officeId
      ? supabase.from('office_members').select('id', { count: 'exact' }).eq('office_id', officeId)
      : Promise.resolve({ count: 0 }),
    officeId
      ? supabase.from('departments').select('id', { count: 'exact' }).eq('office_id', officeId)
      : Promise.resolve({ count: 0 }),
    officeId
      ? supabase
          .from('invitations')
          .select('id', { count: 'exact' })
          .eq('office_id', officeId)
          .eq('status', 'pending')
      : Promise.resolve({ count: 0 }),
  ])

  const stats = [
    {
      title: 'Ekip Üyeleri',
      value: String(membersRes.count ?? 0),
      icon: Users,
      description: 'Aktif üye',
    },
    {
      title: 'Departmanlar',
      value: String(deptsRes.count ?? 0),
      icon: Building2,
      description: 'Oluşturulan departman',
    },
    {
      title: 'Bekleyen Davetler',
      value: String(pendingInvitesRes.count ?? 0),
      icon: Mail,
      description: 'Kabul bekleniyor',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">{greeting}</h1>
        <p className="text-sm text-neutral-500 mt-0.5">
          {officeRes.data?.name ?? 'Ofis'} — hoş geldiniz
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
