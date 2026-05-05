'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import { cancelInvitation } from '@/actions/invitation'
import { InviteMemberDialog } from './invite-member-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { Department } from '@/types'
import { Copy, X } from 'lucide-react'

interface InvitationRow {
  id: string
  email: string
  role: string
  departmentName: string | null
  status: string
  createdAt: string
  token: string
}

interface Props {
  invitations: InvitationRow[]
  departments: Department[]
  officeId: string
}

const statusLabel: Record<string, string> = {
  pending: 'Bekliyor',
  accepted: 'Kabul Edildi',
  expired: 'Süresi Doldu',
}

const statusVariant: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  pending: 'secondary',
  accepted: 'default',
  expired: 'destructive',
}

const roleLabel: Record<string, string> = {
  admin: 'Admin',
  supervisor: 'Süpervizör',
  member: 'Üye',
}

export function InvitationsTab({ invitations, departments, officeId }: Props) {
  const [isPending, startTransition] = useTransition()
  const appUrl = typeof window !== 'undefined' ? window.location.origin : ''

  function copyLink(token: string) {
    navigator.clipboard.writeText(`${appUrl}/invite/${token}`)
    toast.success('Davet linki kopyalandı.')
  }

  function handleCancel(id: string) {
    startTransition(async () => {
      const result = await cancelInvitation(id, officeId)
      if (!result.success) toast.error(result.error ?? 'İptal edilemedi.')
      else toast.success('Davet iptal edildi.')
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-neutral-500">
          {invitations.filter((i) => i.status === 'pending').length} bekleyen davet
        </p>
        <InviteMemberDialog officeId={officeId} departments={departments} />
      </div>

      {invitations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-neutral-400">
          <p className="text-sm">Henüz davet gönderilmedi.</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>E-posta</TableHead>
              <TableHead>Departman</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead>Tarih</TableHead>
              <TableHead className="w-20" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {invitations.map((inv) => (
              <TableRow key={inv.id}>
                <TableCell className="font-medium text-sm">{inv.email}</TableCell>
                <TableCell className="text-sm text-neutral-500">
                  {inv.departmentName ?? '—'}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{roleLabel[inv.role] ?? inv.role}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={statusVariant[inv.status] ?? 'outline'}>
                    {statusLabel[inv.status] ?? inv.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-neutral-400">
                  {new Date(inv.createdAt).toLocaleDateString('tr-TR')}
                </TableCell>
                <TableCell>
                  {inv.status === 'pending' && (
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => copyLink(inv.token)}
                        title="Linki kopyala"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-neutral-400 hover:text-red-600"
                        onClick={() => handleCancel(inv.id)}
                        disabled={isPending}
                        title="İptal et"
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
