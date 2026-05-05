'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { createDepartment } from '@/actions/department'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Plus } from 'lucide-react'

const schema = z.object({
  name: z
    .string()
    .min(2, 'Departman adı en az 2 karakter olmalıdır.')
    .max(80, 'Departman adı en fazla 80 karakter olabilir.'),
})

type FormValues = z.infer<typeof schema>

interface Props {
  officeId: string
}

export function CreateDepartmentDialog({ officeId }: Props) {
  const [open, setOpen] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '' },
  })

  async function onSubmit(values: FormValues) {
    const result = await createDepartment(officeId, values.name)

    if (!result.success) {
      toast.error(result.error ?? 'Bir hata oluştu.')
      return
    }

    toast.success('Departman oluşturuldu.')
    form.reset()
    setOpen(false)
  }

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4 mr-1.5" />
        Departman Ekle
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Yeni Departman</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Departman Adı</FormLabel>
                  <FormControl>
                    <Input placeholder="Ceza Hukuku" autoFocus {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                İptal
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Oluşturuluyor…' : 'Oluştur'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
      </Dialog>
    </>
  )
}
