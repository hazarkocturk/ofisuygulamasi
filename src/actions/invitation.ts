'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendInviteEmail } from '@/lib/resend'
import { revalidatePath } from 'next/cache'
import type { OfficeRole } from '@/types'

interface CreateInvitationParams {
  officeId: string
  email: string
  role: OfficeRole
  departmentId: string | null
}

export async function createInvitation(
  params: CreateInvitationParams
): Promise<{ success: boolean; error?: string; inviteUrl?: string; emailSent?: boolean }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Oturum açmanız gerekiyor.' }

  const { data: isAdmin } = await supabase.rpc('is_office_admin', { p_office_id: params.officeId })
  if (!isAdmin) return { success: false, error: 'Bu işlem için yetkiniz yok.' }

  const normalizedEmail = params.email.toLowerCase().trim()

  const { data: existingInvite } = await supabase
    .from('invitations')
    .select('id')
    .eq('office_id', params.officeId)
    .eq('email', normalizedEmail)
    .eq('status', 'pending')
    .maybeSingle()

  if (existingInvite) {
    return { success: false, error: 'Bu e-postaya zaten bekleyen bir davet mevcut.' }
  }

  const token = crypto.randomUUID()
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

  const { error: insertError } = await supabase.from('invitations').insert({
    office_id: params.officeId,
    email: normalizedEmail,
    role: params.role,
    department_id: params.departmentId,
    invited_by: user.id,
    token,
    expires_at: expiresAt,
    status: 'pending',
  })

  if (insertError) return { success: false, error: 'Davet oluşturulamadı.' }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const inviteUrl = `${appUrl}/invite/${token}`

  const [profileResult, officeResult] = await Promise.all([
    supabase.from('profiles').select('full_name').eq('id', user.id).single(),
    supabase.from('offices').select('name').eq('id', params.officeId).single(),
  ])

  let departmentName: string | null = null
  if (params.departmentId) {
    const { data: dept } = await supabase
      .from('departments')
      .select('name')
      .eq('id', params.departmentId)
      .single()
    departmentName = dept?.name ?? null
  }

  const emailSent = await sendInviteEmail({
    to: normalizedEmail,
    inviterName: profileResult.data?.full_name ?? 'Yönetici',
    officeName: officeResult.data?.name ?? 'Ofis',
    departmentName,
    inviteUrl,
  })

  revalidatePath('/team')
  return { success: true, inviteUrl, emailSent }
}

export async function acceptInvitation(
  token: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Oturum açmanız gerekiyor.' }

  const admin = createAdminClient()

  const { data: invite, error: fetchError } = await admin
    .from('invitations')
    .select('*')
    .eq('token', token)
    .eq('status', 'pending')
    .single()

  if (fetchError || !invite) return { success: false, error: 'Geçersiz veya süresi dolmuş davet.' }

  if (new Date(invite.expires_at) < new Date()) {
    await admin.from('invitations').update({ status: 'expired' }).eq('id', invite.id)
    return { success: false, error: 'Davet süresi dolmuş.' }
  }

  const { data: existingMember } = await admin
    .from('office_members')
    .select('id')
    .eq('office_id', invite.office_id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!existingMember) {
    const { error: memberError } = await admin
      .from('office_members')
      .insert({ office_id: invite.office_id, user_id: user.id, role: invite.role })

    if (memberError) return { success: false, error: 'Üyelik oluşturulamadı.' }
  }

  if (invite.department_id) {
    const { data: existingDeptMember } = await admin
      .from('department_members')
      .select('id')
      .eq('department_id', invite.department_id)
      .eq('user_id', user.id)
      .maybeSingle()

    if (!existingDeptMember) {
      await admin
        .from('department_members')
        .insert({ department_id: invite.department_id, user_id: user.id })
    }
  }

  await admin.from('invitations').update({ status: 'accepted' }).eq('id', invite.id)

  return { success: true }
}

export async function cancelInvitation(
  invitationId: string,
  officeId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Oturum açmanız gerekiyor.' }

  const { data: isAdmin } = await supabase.rpc('is_office_admin', { p_office_id: officeId })
  if (!isAdmin) return { success: false, error: 'Bu işlem için yetkiniz yok.' }

  const { error } = await supabase.from('invitations').delete().eq('id', invitationId)

  if (error) return { success: false, error: 'Davet iptal edilemedi.' }

  revalidatePath('/team')
  return { success: true }
}
