'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { updateMemberRole, toggleSupervisor, removeMember, removeDepartmentMember } from '@/actions/member'
import { AssignDepartmentDialog } from './assign-department-dialog'
import type { Department } from '@/types'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal } from 'lucide-react'

interface MemberDept {
  departmentMemberId: string
  departmentId: string
  departmentName: string
}

interface Props {
  memberId: string
  userId: string
  officeId: string
  currentRole: string
  isSupervisor: boolean
  departments: Department[]
  memberDepts: MemberDept[]
  isCurrentUser: boolean
}

export function MemberActions({
  memberId,
  userId,
  officeId,
  currentRole,
  isSupervisor,
  departments,
  memberDepts,
  isCurrentUser,
}: Props) {
  const [assignOpen, setAssignOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleRoleChange(role: 'admin' | 'supervisor' | 'member') {
    startTransition(async () => {
      const result = await updateMemberRole(memberId, role, officeId)
      if (!result.success) toast.error(result.error ?? 'Rol güncellenemedi.')
      else toast.success('Rol güncellendi.')
    })
  }

  function handleToggleSupervisor() {
    startTransition(async () => {
      const result = await toggleSupervisor(memberId, !isSupervisor, officeId)
      if (!result.success) toast.error(result.error ?? 'Süpervizörlük güncellenemedi.')
      else toast.success(isSupervisor ? 'Süpervizörlük kaldırıldı.' : 'Süpervizör atandı.')
    })
  }

  function handleRemoveDept(departmentMemberId: string, name: string) {
    startTransition(async () => {
      const result = await removeDepartmentMember(departmentMemberId, officeId)
      if (!result.success) toast.error(result.error ?? 'Bir hata oluştu.')
      else toast.success(`${name} departmanından çıkarıldı.`)
    })
  }

  function handleRemoveMember() {
    startTransition(async () => {
      const result = await removeMember(memberId, officeId)
      if (!result.success) toast.error(result.error ?? 'Üye çıkarılamadı.')
      else toast.success('Üye ofisten çıkarıldı.')
    })
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 disabled:pointer-events-none disabled:opacity-50"
          disabled={isPending}
        >
          <MoreHorizontal className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Rol Değiştir</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem
                onClick={() => handleRoleChange('admin')}
                disabled={currentRole === 'admin'}
              >
                Admin
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleRoleChange('supervisor')}
                disabled={currentRole === 'supervisor'}
              >
                Süpervizör
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleRoleChange('member')}
                disabled={currentRole === 'member'}
              >
                Üye
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuItem onClick={handleToggleSupervisor}>
            {isSupervisor ? 'Süpervizörlüğü Kaldır' : 'Süpervizör Ata'}
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => setAssignOpen(true)}>
            Departmana Ekle
          </DropdownMenuItem>

          {memberDepts.length > 0 && (
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Departmandan Çıkar</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {memberDepts.map((d) => (
                  <DropdownMenuItem
                    key={d.departmentMemberId}
                    onClick={() => handleRemoveDept(d.departmentMemberId, d.departmentName)}
                  >
                    {d.departmentName}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          )}

          {!isCurrentUser && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleRemoveMember}
                className="text-red-600 focus:text-red-600"
              >
                Ofisten Çıkar
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AssignDepartmentDialog
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
        userId={userId}
        officeId={officeId}
        departments={departments}
        currentDepartmentIds={memberDepts.map((d) => d.departmentId)}
      />
    </>
  )
}
