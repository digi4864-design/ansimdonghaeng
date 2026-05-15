'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

interface Stats {
  totalBookings: number
  inProgress: number
  pendingManagers: number
  todayCompleted: number
}

export default function StatsPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/stats')
      .then((r) => setStats(r.data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false))
  }, [])

  const cards = [
    { label: '총 예약', value: stats?.totalBookings, color: 'bg-blue-500' },
    { label: '진행 중', value: stats?.inProgress, color: 'bg-green-500' },
    { label: '승인 대기 매니저', value: stats?.pendingManagers, color: 'bg-yellow-500' },
    { label: '오늘 완료', value: stats?.todayCompleted, color: 'bg-purple-500' },
  ]

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">대시보드</h2>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-white rounded-xl shadow p-6">
            <div className={`w-10 h-10 rounded-lg ${c.color} mb-3`} />
            <p className="text-sm text-slate-500">{c.label}</p>
            <p className="text-3xl font-bold mt-1">
              {loading ? '...' : (c.value ?? 0).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
      {!loading && !stats && (
        <p className="mt-8 text-red-400 text-sm">API 연결에 실패했습니다. 서버 상태를 확인해주세요.</p>
      )}
    </div>
  )
}
