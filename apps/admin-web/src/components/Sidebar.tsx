'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Users, Calendar, UserCheck, BarChart2, Settings } from 'lucide-react'

const navItems = [
  { href: '/stats', label: '대시보드', icon: BarChart2 },
  { href: '/bookings', label: '예약 관리', icon: Calendar },
  { href: '/managers', label: '매니저 관리', icon: UserCheck },
  { href: '/users', label: '회원 관리', icon: Users },
  { href: '/settings', label: '설정', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  return (
    <aside className="w-60 bg-slate-900 text-white flex flex-col min-h-screen">
      <div className="px-6 py-5 border-b border-slate-700">
        <h1 className="text-lg font-bold">안심동행 관리자</h1>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
              pathname.startsWith(href)
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Icon size={18} />
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
