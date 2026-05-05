import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CreateOfficeForm } from '@/components/onboarding/create-office-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2 } from 'lucide-react'

export default async function OnboardingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: member } = await supabase
    .from('office_members')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (member) redirect('/')

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
            <CardTitle className="text-xl">Ofisinizi Oluşturun</CardTitle>
            <CardDescription>
              Hukuk büronuz için bir çalışma alanı oluşturun. Departmanlar ekleyin, ekibinizi davet edin.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CreateOfficeForm />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
