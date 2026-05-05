'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  CheckSquare,
  FolderKanban,
  Users,
  MessageSquare,
  Calendar,
  Settings,
} from 'lucide-react'

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/team', label: 'Ekip', icon: Users },
  { href: '/tasks', label: 'Görevler', icon: CheckSquare },
  { href: '/projects', label: 'Projeler', icon: FolderKanban },
  { href: '/messages', label: 'Mesajlar', icon: MessageSquare },
  { href: '/calendar', label: 'Takvim', icon: Calendar },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex h-full w-60 flex-col border-r border-neutral-200 bg-white">
      <div className="flex h-14 items-center border-b border-neutral-200 px-4">
        <span className="text-lg font-semibold tracking-tight">Ofis</span>
      </div>
      <nav className="flex-1 space-y-0.5 p-2">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              pathname === href
                ? 'bg-neutral-100 text-neutral-900'
                : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900'
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>
      <div className="border-t border-neutral-200 p-2">
        <Link
          href="/settings"
          className={cn(
            'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
            pathname === '/settings'
              ? 'bg-neutral-100 text-neutral-900'
              : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900'
          )}
        >
          <Settings className="h-4 w-4" />
          Ayarlar
        </Link>
      </div>
    </aside>
  )
}
