'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createDepartment(
  officeId: string,
  name: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Oturum açmanız gerekiyor.' }

  const { data: isAdmin } = await supabase.rpc('is_office_admin', { p_office_id: officeId })
  if (!isAdmin) return { success: false, error: 'Bu işlem için yetkiniz yok.' }

  const { error } = await supabase
    .from('departments')
    .insert({ office_id: officeId, name: name.trim() })

  if (error) return { success: false, error: 'Departman oluşturulamadı.' }

  revalidatePath('/team')
  return { success: true }
}

export async function deleteDepartment(
  departmentId: string,
  officeId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Oturum açmanız gerekiyor.' }

  const { data: isAdmin } = await supabase.rpc('is_office_admin', { p_office_id: officeId })
  if (!isAdmin) return { success: false, error: 'Bu işlem için yetkiniz yok.' }

  const { error } = await supabase.from('departments').delete().eq('id', departmentId)

  if (error) return { success: false, error: 'Departman silinemedi.' }

  revalidatePath('/team')
  return { success: true }
}
