import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '안심동행 관리자',
  description: '안심동행 플랫폼 관리자 대시보드',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className="h-full">
      <body className="h-full bg-slate-50">{children}</body>
    </html>
  )
}
