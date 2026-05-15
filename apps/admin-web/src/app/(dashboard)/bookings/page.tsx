'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'

const STATUS_LABEL: Record<string, string> = {
  PENDING: '매칭 중',
  MATCHED: '배정 완료',
  IN_PROGRESS: '진행 중',
  COMPLETED: '완료',
  CANCELLED: '취소',
}

const STATUS_COLOR: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  MATCHED: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-green-100 text-green-800',
  COMPLETED: 'bg-gray-100 text-gray-800',
  CANCELLED: 'bg-red-100 text-red-800',
}

export default function BookingsPage() {
  const router = useRouter()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/bookings')
      .then((r) => setData(r.data))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">예약 관리</h2>
      {loading ? (
        <p className="text-slate-400">불러오는 중...</p>
      ) : (
        <>
          <p className="text-sm text-slate-500 mb-4">총 {data?.total ?? 0}건</p>
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b">
                <tr>
                  {['병원명', '어르신', '매니저', '예약 일시', '금액', '상태'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-slate-600 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(data?.bookings ?? []).map((b: any) => (
                  <tr key={b.id} onClick={() => router.push(`/bookings/${b.id}`)} className="hover:bg-slate-50 transition-colors cursor-pointer">
                    <td className="px-4 py-3 font-medium">{b.hospitalName}</td>
                    <td className="px-4 py-3 text-slate-600">{b.elder?.user?.name ?? '-'}</td>
                    <td className="px-4 py-3 text-slate-600">{b.manager?.user?.name ?? '미배정'}</td>
                    <td className="px-4 py-3 text-slate-600">{new Date(b.scheduledAt).toLocaleString('ko-KR')}</td>
                    <td className="px-4 py-3">{b.price.toLocaleString()}원</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLOR[b.status] ?? 'bg-gray-100 text-gray-800'}`}>
                        {STATUS_LABEL[b.status] ?? b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data?.bookings?.length === 0 && (
              <p className="text-center text-slate-400 py-12">예약 내역이 없습니다</p>
            )}
          </div>
        </>
      )}
    </div>
  )
}
