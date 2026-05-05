'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import { deleteDepartment } from '@/actions/department'
import { CreateDepartmentDialog } from './create-department-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Trash2, Users } from 'lucide-react'

interface DeptRow {
  id: string
  name: string
  memberCount: number
}

interface Props {
  departments: DeptRow[]
  officeId: string
}

export function DepartmentsTab({ departments, officeId }: Props) {
  const [isPending, startTransition] = useTransition()

  function handleDelete(deptId: string, name: string) {
    startTransition(async () => {
      const result = await deleteDepartment(deptId, officeId)
      if (!result.success) toast.error(result.error ?? 'Departman silinemedi.')
      else toast.success(`${name} departmanı silindi.`)
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-neutral-500">
          {departments.length} departman
        </p>
        <CreateDepartmentDialog officeId={officeId} />
      </div>

      {departments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-neutral-400">
          <p className="text-sm">Henüz departman oluşturulmadı.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {departments.map((d) => (
            <Card key={d.id}>
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <CardTitle className="text-sm font-medium">{d.name}</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-neutral-400 hover:text-red-600 -mt-1 -mr-1"
                  onClick={() => handleDelete(d.id, d.name)}
                  disabled={isPending}
                  title="Sil"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-1.5 text-neutral-500">
                  <Users className="h-3.5 w-3.5" />
                  <span className="text-xs">{d.memberCount} üye</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
