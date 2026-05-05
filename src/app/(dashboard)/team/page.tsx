import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { MembersTab } from '@/components/team/members-tab'
import { DepartmentsTab } from '@/components/team/departments-tab'
import { InvitationsTab } from '@/components/team/invitations-tab'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default async function TeamPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: adminMember } = await supabase
    .from('office_members')
    .select('office_id, role')
    .eq('user_id', user.id)
    .eq('role', 'admin')
    .maybeSingle()

  if (!adminMember) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-neutral-500">Bu sayfaya erişim yetkiniz yok.</p>
      </div>
    )
  }

  const officeId = adminMember.office_id

  const [officeRes, membersRes, deptsRes, invitesRes, deptMembersRes] = await Promise.all([
    supabase.from('offices').select('id, name').eq('id', officeId).single(),
    supabase
      .from('office_members')
      .select('id, user_id, role, is_supervisor, joined_at, profiles(id, full_name)')
      .eq('office_id', officeId),
    supabase
      .from('departments')
      .select('id, name, created_at')
      .eq('office_id', officeId)
      .order('created_at'),
    supabase
      .from('invitations')
      .select('id, email, role, status, created_at, token, department_id, departments(name)')
      .eq('office_id', officeId)
      .order('created_at', { ascending: false }),
    supabase
      .from('department_members')
      .select('id, user_id, department_id, departments(id, name)')
      .in(
        'department_id',
        (await supabase.from('departments').select('id').eq('office_id', officeId)).data?.map((d) => d.id) ?? []
      ),
  ])

  const rawMembers = membersRes.data ?? []
  const deptMemberships = deptMembersRes.data ?? []

  const memberRows = rawMembers.map((m) => {
    const profile = m.profiles as { id: string; full_name: string | null } | null
    const myDepts = deptMemberships
      .filter((dm) => dm.user_id === m.user_id)
      .map((dm) => {
        const dept = dm.departments as { id: string; name: string } | null
        return {
          departmentMemberId: dm.id,
          departmentId: dm.department_id,
          departmentName: dept?.name ?? '',
        }
      })

    return {
      id: m.id,
      userId: m.user_id,
      role: m.role,
      isSupervisor: m.is_supervisor,
      name: profile?.full_name ?? 'İsimsiz Kullanıcı',
      depts: myDepts,
    }
  })

  const deptRows = (deptsRes.data ?? []).map((d) => ({
    id: d.id,
    name: d.name,
    memberCount: deptMemberships.filter((dm) => dm.department_id === d.id).length,
  }))

  const departments = (deptsRes.data ?? []).map((d) => ({ id: d.id, name: d.name, office_id: officeId, created_at: d.created_at }))

  const invitationRows = (invitesRes.data ?? []).map((inv) => {
    const dept = inv.departments as { name: string } | null
    return {
      id: inv.id,
      email: inv.email,
      role: inv.role,
      departmentName: dept?.name ?? null,
      status: inv.status,
      createdAt: inv.created_at,
      token: inv.token,
    }
  })

  const pendingCount = invitationRows.filter((i) => i.status === 'pending').length
  const memberCount = rawMembers.length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">
          {officeRes.data?.name ?? 'Ekip'}
        </h1>
        <p className="text-sm text-neutral-500 mt-0.5">
          {memberCount} üye · {deptRows.length} departman · {pendingCount} bekleyen davet
        </p>
      </div>

      <Tabs defaultValue="members">
        <TabsList>
          <TabsTrigger value="members">Üyeler ({memberCount})</TabsTrigger>
          <TabsTrigger value="departments">Departmanlar ({deptRows.length})</TabsTrigger>
          <TabsTrigger value="invitations">Davetler ({invitationRows.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="mt-4">
          <MembersTab
            members={memberRows}
            departments={departments}
            officeId={officeId}
            currentUserId={user.id}
          />
        </TabsContent>

        <TabsContent value="departments" className="mt-4">
          <DepartmentsTab departments={deptRows} officeId={officeId} />
        </TabsContent>

        <TabsContent value="invitations" className="mt-4">
          <InvitationsTab
            invitations={invitationRows}
            departments={departments}
            officeId={officeId}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
