import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function ProjectsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-neutral-900">Projeler</h1>
        <Badge variant="secondary">Yakında</Badge>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Proje listesi</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-neutral-500">Proje yönetimi özellikleri yakında eklenecek.</p>
        </CardContent>
      </Card>
    </div>
  )
}
