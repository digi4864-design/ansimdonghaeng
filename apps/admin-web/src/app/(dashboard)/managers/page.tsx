'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

const STATUS_LABEL: Record<string, string> = { PENDING: '심사 중', APPROVED: '승인', SUSPENDED: '정지' }
const STATUS_COLOR: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-green-100 text-green-800',
  SUSPENDED: 'bg-red-100 text-red-800',
}

export default function ManagersPage() {
  const [managers, setManagers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    api.get('/admin/managers')
      .then((r) => setManagers(r.data))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const approve = async (id: string) => {
    setActionId(id)
    await api.patch(`/admin/managers/${id}/approve`)
    load()
    setActionId(null)
  }

  const suspend = async (id: string) => {
    setActionId(id)
    await api.patch(`/admin/managers/${id}/suspend`)
    load()
    setActionId(null)
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">매니저 관리</h2>
      {loading ? (
        <p className="text-slate-400">불러오는 중...</p>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b">
              <tr>
                {['이름', '전화번호', '평점', '서비스 지역', '자격증', '상태', '액션'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-slate-600 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {managers.map((m: any) => (
                <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-medium">{m.user?.name}</td>
                  <td className="px-4 py-3 text-slate-600">{m.user?.phone}</td>
                  <td className="px-4 py-3">{m.rating.toFixed(1)} ({m.reviewCount})</td>
                  <td className="px-4 py-3 text-slate-600 text-xs">{m.serviceAreas.join(', ') || '-'}</td>
                  <td className="px-4 py-3 text-slate-600">{m.certifications?.length ?? 0}개</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLOR[m.status] ?? ''}`}>
                      {STATUS_LABEL[m.status] ?? m.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {m.status !== 'APPROVED' && (
                        <button
                          onClick={() => approve(m.id)}
                          disabled={actionId === m.id}
                          className="px-3 py-1 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                        >
                          승인
                        </button>
                      )}
                      {m.status !== 'SUSPENDED' && (
                        <button
                          onClick={() => suspend(m.id)}
                          disabled={actionId === m.id}
                          className="px-3 py-1 text-xs bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
                        >
                          정지
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {managers.length === 0 && (
            <p className="text-center text-slate-400 py-12">매니저가 없습니다</p>
          )}
        </div>
      )}
    </div>
  )
}
