import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function TasksPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-neutral-900">Görevler</h1>
        <Badge variant="secondary">Yakında</Badge>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Görev listesi</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-neutral-500">Görev yönetimi özellikleri yakında eklenecek.</p>
        </CardContent>
      </Card>
    </div>
  )
}
