'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { createInvitation } from '@/actions/invitation'
import type { Department } from '@/types'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Copy, UserPlus } from 'lucide-react'

const schema = z.object({
  email: z.string().email('Geçerli bir e-posta adresi girin.'),
  role: z.enum(['admin', 'supervisor', 'member']),
  departmentId: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface Props {
  officeId: string
  departments: Department[]
}

export function InviteMemberDialog({ officeId, departments }: Props) {
  const [open, setOpen] = useState(false)
  const [inviteUrl, setInviteUrl] = useState<string | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', role: 'member', departmentId: undefined },
  })

  async function onSubmit(values: FormValues) {
    const result = await createInvitation({
      officeId,
      email: values.email,
      role: values.role,
      departmentId: values.departmentId ?? null,
    })

    if (!result.success) {
      toast.error(result.error ?? 'Bir hata oluştu.')
      return
    }

    if (result.emailSent) {
      toast.success(`Davet maili ${values.email} adresine gönderildi.`)
    } else {
      setInviteUrl(result.inviteUrl ?? null)
      toast.success('Davet oluşturuldu.')
    }

    form.reset()
  }

  function copyLink() {
    if (!inviteUrl) return
    navigator.clipboard.writeText(inviteUrl)
    toast.success('Davet linki kopyalandı.')
  }

  function handleClose(val: boolean) {
    setOpen(val)
    if (!val) {
      setInviteUrl(null)
      form.reset()
    }
  }

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <UserPlus className="h-4 w-4 mr-1.5" />
        Davet Gönder
      </Button>
      <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Ekip Üyesi Davet Et</DialogTitle>
        </DialogHeader>

        {inviteUrl ? (
          <div className="space-y-4">
            <Alert>
              <AlertDescription className="text-xs text-neutral-600">
                E-posta servisi yapılandırılmamış. Davet linkini kopyalayarak paylaşabilirsiniz.
              </AlertDescription>
            </Alert>
            <div className="flex gap-2">
              <Input value={inviteUrl} readOnly className="text-xs" />
              <Button size="icon" variant="outline" onClick={copyLink} title="Kopyala">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <Button className="w-full" onClick={() => handleClose(false)}>
              Tamam
            </Button>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-posta</FormLabel>
                    <FormControl>
                      <Input placeholder="avukat@example.com" autoFocus {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rol</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="member">Üye</SelectItem>
                        <SelectItem value="supervisor">Süpervizör</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {departments.length > 0 && (
                <FormField
                  control={form.control}
                  name="departmentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Departman (opsiyonel)</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seçin…" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {departments.map((d) => (
                            <SelectItem key={d.id} value={d.id}>
                              {d.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => handleClose(false)}>
                  İptal
                </Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? 'Gönderiliyor…' : 'Davet Et'}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
      </Dialog>
    </>
  )
}
