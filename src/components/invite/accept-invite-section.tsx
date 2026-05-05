'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { acceptInvitation } from '@/actions/invitation'
import { toTurkishAuthError } from '@/lib/auth-errors'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'

const registerSchema = z.object({
  fullName: z.string().min(2, 'Ad soyad en az 2 karakter olmalıdır.'),
  password: z
    .string()
    .min(8, 'Şifre en az 8 karakter olmalıdır.')
    .regex(/[A-Z]/, 'Şifre en az bir büyük harf içermelidir.')
    .regex(/[0-9]/, 'Şifre en az bir rakam içermelidir.'),
})

type RegisterValues = z.infer<typeof registerSchema>

interface Props {
  token: string
  email: string
  isLoggedIn: boolean
}

export function AcceptInviteSection({ token, email, isLoggedIn }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [serverError, setServerError] = useState<string | null>(null)

  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: '', password: '' },
  })

  function handleAccept() {
    startTransition(async () => {
      const result = await acceptInvitation(token)
      if (!result.success) {
        toast.error(result.error ?? 'Davet kabul edilemedi.')
        return
      }
      toast.success('Daveti kabul ettiniz! Yönlendiriliyorsunuz…')
      router.push('/')
      router.refresh()
    })
  }

  async function onRegisterSubmit(values: RegisterValues) {
    setServerError(null)
    const supabase = createClient()

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password: values.password,
      options: { data: { full_name: values.fullName } },
    })

    if (signUpError) {
      setServerError(toTurkishAuthError(signUpError.message))
      return
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: values.password,
    })

    if (signInError) {
      setServerError(toTurkishAuthError(signInError.message))
      return
    }

    const result = await acceptInvitation(token)
    if (!result.success) {
      toast.error(result.error ?? 'Davet kabul edilemedi.')
      return
    }

    toast.success('Hoş geldiniz!')
    router.push('/')
    router.refresh()
  }

  if (isLoggedIn) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-neutral-500 text-center">
          Daveti kabul ederek ofise katılabilirsiniz.
        </p>
        <Button className="w-full" onClick={handleAccept} disabled={isPending}>
          {isPending ? 'Kabul ediliyor…' : 'Daveti Kabul Et'}
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-neutral-500">
        Davet e-postası: <span className="font-medium text-neutral-700">{email}</span>
      </p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onRegisterSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ad Soyad</FormLabel>
                <FormControl>
                  <Input placeholder="Adınız Soyadınız" autoFocus {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Şifre</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="En az 8 karakter" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {serverError && (
            <p className="text-sm font-medium text-destructive">{serverError}</p>
          )}
          <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Kaydediliyor…' : 'Kayıt Ol ve Kabul Et'}
          </Button>
        </form>
      </Form>

      <Separator />

      <p className="text-center text-sm text-neutral-500">
        Zaten hesabınız var mı?{' '}
        <Link
          href={`/login?redirect=/invite/${token}`}
          className="text-neutral-900 font-medium hover:underline"
        >
          Giriş Yap
        </Link>
      </p>
    </div>
  )
}
