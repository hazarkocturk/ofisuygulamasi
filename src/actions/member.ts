'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { OfficeRole } from '@/types'

export async function updateMemberRole(
  memberId: string,
  role: OfficeRole,
  officeId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Oturum açmanız gerekiyor.' }

  const { data: isAdmin } = await supabase.rpc('is_office_admin', { p_office_id: officeId })
  if (!isAdmin) return { success: false, error: 'Bu işlem için yetkiniz yok.' }

  const { error } = await supabase
    .from('office_members')
    .update({ role })
    .eq('id', memberId)

  if (error) return { success: false, error: 'Rol güncellenemedi.' }

  revalidatePath('/team')
  return { success: true }
}

export async function toggleSupervisor(
  memberId: string,
  isSupervisor: boolean,
  officeId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Oturum açmanız gerekiyor.' }

  const { data: isAdmin } = await supabase.rpc('is_office_admin', { p_office_id: officeId })
  if (!isAdmin) return { success: false, error: 'Bu işlem için yetkiniz yok.' }

  const { error } = await supabase
    .from('office_members')
    .update({ is_supervisor: isSupervisor })
    .eq('id', memberId)

  if (error) return { success: false, error: 'Süpervizörlük güncellenemedi.' }

  revalidatePath('/team')
  return { success: true }
}

export async function assignDepartment(
  userId: string,
  departmentId: string,
  officeId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Oturum açmanız gerekiyor.' }

  const { data: isAdmin } = await supabase.rpc('is_office_admin', { p_office_id: officeId })
  if (!isAdmin) return { success: false, error: 'Bu işlem için yetkiniz yok.' }

  const { data: existing } = await supabase
    .from('department_members')
    .select('id')
    .eq('user_id', userId)
    .eq('department_id', departmentId)
    .maybeSingle()

  if (existing) return { success: false, error: 'Kişi zaten bu departmanda.' }

  const { error } = await supabase
    .from('department_members')
    .insert({ user_id: userId, department_id: departmentId })

  if (error) return { success: false, error: 'Departmana eklenemedi.' }

  revalidatePath('/team')
  return { success: true }
}

export async function removeDepartmentMember(
  departmentMemberId: string,
  officeId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Oturum açmanız gerekiyor.' }

  const { data: isAdmin } = await supabase.rpc('is_office_admin', { p_office_id: officeId })
  if (!isAdmin) return { success: false, error: 'Bu işlem için yetkiniz yok.' }

  const { error } = await supabase
    .from('department_members')
    .delete()
    .eq('id', departmentMemberId)

  if (error) return { success: false, error: 'Departmandan çıkarılamadı.' }

  revalidatePath('/team')
  return { success: true }
}

export async function removeMember(
  memberId: string,
  officeId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Oturum açmanız gerekiyor.' }

  const { data: isAdmin } = await supabase.rpc('is_office_admin', { p_office_id: officeId })
  if (!isAdmin) return { success: false, error: 'Bu işlem için yetkiniz yok.' }

  const { error } = await supabase
    .from('office_members')
    .delete()
    .eq('id', memberId)

  if (error) return { success: false, error: 'Üye çıkarılamadı.' }

  revalidatePath('/team')
  return { success: true }
}
