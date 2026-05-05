'use client'

import { MemberActions } from './member-actions'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { Department } from '@/types'

interface DeptEntry {
  departmentMemberId: string
  departmentId: string
  departmentName: string
}

interface MemberRow {
  id: string
  userId: string
  role: string
  isSupervisor: boolean
  name: string
  depts: DeptEntry[]
}

interface Props {
  members: MemberRow[]
  departments: Department[]
  officeId: string
  currentUserId: string
}

const roleLabel: Record<string, string> = {
  admin: 'Admin',
  supervisor: 'Süpervizör',
  member: 'Üye',
}

const roleVariant: Record<string, 'default' | 'secondary' | 'outline'> = {
  admin: 'default',
  supervisor: 'secondary',
  member: 'outline',
}

export function MembersTab({ members, departments, officeId, currentUserId }: Props) {
  if (members.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-neutral-400">
        <p className="text-sm">Henüz ekip üyesi yok.</p>
        <p className="text-xs mt-1">Davetler sekmesinden kişi davet edebilirsiniz.</p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Üye</TableHead>
          <TableHead>Rol</TableHead>
          <TableHead>Departmanlar</TableHead>
          <TableHead className="w-12" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {members.map((m) => {
          const initials = m.name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)

          return (
            <TableRow key={m.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-neutral-100 text-neutral-700 text-xs font-medium">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium leading-none">
                      {m.name}
                      {m.isSupervisor && (
                        <span className="ml-2 text-xs text-neutral-400">(Süpervizör)</span>
                      )}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={roleVariant[m.role] ?? 'outline'}>
                  {roleLabel[m.role] ?? m.role}
                </Badge>
              </TableCell>
              <TableCell>
                {m.depts.length === 0 ? (
                  <span className="text-xs text-neutral-400">—</span>
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {m.depts.map((d) => (
                      <Badge key={d.departmentId} variant="secondary" className="text-xs">
                        {d.departmentName}
                      </Badge>
                    ))}
                  </div>
                )}
              </TableCell>
              <TableCell>
                <MemberActions
                  memberId={m.id}
                  userId={m.userId}
                  officeId={officeId}
                  currentRole={m.role}
                  isSupervisor={m.isSupervisor}
                  departments={departments}
                  memberDepts={m.depts}
                  isCurrentUser={m.userId === currentUserId}
                />
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
