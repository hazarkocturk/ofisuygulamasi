'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { createOffice } from '@/actions/office'
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

const schema = z.object({
  name: z
    .string()
    .min(2, 'Ofis adı en az 2 karakter olmalıdır.')
    .max(100, 'Ofis adı en fazla 100 karakter olabilir.'),
})

type FormValues = z.infer<typeof schema>

export function CreateOfficeForm() {
  const router = useRouter()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '' },
  })

  async function onSubmit(values: FormValues) {
    const result = await createOffice(values.name)

    if (!result.success) {
      toast.error(result.error ?? 'Bir hata oluştu.')
      return
    }

    toast.success('Ofis oluşturuldu!')
    router.push('/')
    router.refresh()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ofis Adı</FormLabel>
              <FormControl>
                <Input placeholder="Kocatürk Hukuk Bürosu" autoFocus {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Oluşturuluyor…' : 'Ofisi Oluştur'}
        </Button>
      </form>
    </Form>
  )
}
