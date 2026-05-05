'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { assignDepartment } from '@/actions/member'
import type { Department } from '@/types'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Props {
  open: boolean
  onClose: () => void
  userId: string
  officeId: string
  departments: Department[]
  currentDepartmentIds: string[]
}

export function AssignDepartmentDialog({
  open,
  onClose,
  userId,
  officeId,
  departments,
  currentDepartmentIds,
}: Props) {
  const [departmentId, setDepartmentId] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const available = departments.filter((d) => !currentDepartmentIds.includes(d.id))

  async function handleAssign() {
    if (!departmentId || departmentId === '') return
    setLoading(true)
    const result = await assignDepartment(userId, departmentId, officeId)
    setLoading(false)

    if (!result.success) {
      toast.error(result.error ?? 'Bir hata oluştu.')
      return
    }

    toast.success('Departmana eklendi.')
    setDepartmentId('')
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Departmana Ekle</DialogTitle>
        </DialogHeader>
        {available.length === 0 ? (
          <p className="text-sm text-neutral-500">Eklenebilecek başka departman yok.</p>
        ) : (
          <div className="space-y-4">
            <Select value={departmentId} onValueChange={(val) => setDepartmentId(val ?? '')}>
              <SelectTrigger>
                <SelectValue placeholder="Departman seçin…" />
              </SelectTrigger>
              <SelectContent>
                {available.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={onClose}>
                İptal
              </Button>
              <Button onClick={handleAssign} disabled={!departmentId || loading}>
                {loading ? 'Ekleniyor…' : 'Ekle'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
