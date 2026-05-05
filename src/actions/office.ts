'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
    .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export async function createOffice(
  name: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Oturum açmanız gerekiyor.' }

  const trimmedName = name.trim()
  const baseSlug = toSlug(trimmedName)
  if (!baseSlug) return { success: false, error: 'Geçerli bir ofis adı girin.' }

  const admin = createAdminClient()

  const { data: existing } = await admin
    .from('offices')
    .select('slug')
    .eq('slug', baseSlug)
    .maybeSingle()

  const slug = existing ? `${baseSlug}-${Date.now()}` : baseSlug

  const { data: office, error: officeError } = await admin
    .from('offices')
    .insert({ name: trimmedName, slug, owner_id: user.id })
    .select()
    .single()

  if (officeError || !office) return { success: false, error: 'Ofis oluşturulamadı.' }

  const { error: memberError } = await admin
    .from('office_members')
    .insert({ office_id: office.id, user_id: user.id, role: 'admin' })

  if (memberError) {
    await admin.from('offices').delete().eq('id', office.id)
    return { success: false, error: 'Üyelik oluşturulamadı.' }
  }

  revalidatePath('/')
  return { success: true }
}
