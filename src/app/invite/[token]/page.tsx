import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { AcceptInviteSection } from '@/components/invite/accept-invite-section'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface Props {
  params: Promise<{ token: string }>
}

export default async function InvitePage({ params }: Props) {
  const { token } = await params
  const admin = createAdminClient()

  const { data: invite } = await admin
    .from('invitations')
    .select('id, email, role, status, expires_at, office_id, department_id, offices(name), departments(name)')
    .eq('token', token)
    .single()

  if (!invite) {
    return <InviteError message="Davet bulunamadı veya geçersiz." />
  }

  if (invite.status === 'accepted') {
    return <InviteError message="Bu davet zaten kabul edilmiş." />
  }

  if (invite.status === 'expired' || new Date(invite.expires_at) < new Date()) {
    return <InviteError message="Bu davetin süresi dolmuş." />
  }

  const office = invite.offices as { name: string } | null
  const department = invite.departments as { name: string } | null

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const { data: existingMember } = await admin
      .from('office_members')
      .select('id')
      .eq('office_id', invite.office_id)
      .eq('user_id', user.id)
      .maybeSingle()

    if (existingMember) redirect('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="w-full max-w-md px-4">
        <div className="flex justify-center mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-900">
            <Building2 className="h-6 w-6 text-white" />
          </div>
        </div>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">{office?.name ?? 'Ofis'}</CardTitle>
            <CardDescription>
              {department
                ? `${department.name} departmanına davet edildiniz.`
                : 'Ofise katılmaya davet edildiniz.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AcceptInviteSection
              token={token}
              email={invite.email}
              isLoggedIn={!!user}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function InviteError({ message }: { message: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="w-full max-w-sm px-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      </div>
    </div>
  )
}
