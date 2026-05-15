'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { api } from '@/lib/api'

const TRANSPORT_LABEL: Record<string, string> = {
  TAXI: '택시',
  MANAGER_CAR: '매니저 자가용',
  PUBLIC_TRANSIT: '대중교통',
  WALKING: '도보',
}

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

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex py-3 border-b border-slate-100 last:border-0">
      <span className="w-36 text-sm text-slate-500 shrink-0">{label}</span>
      <span className="text-sm font-medium text-slate-800">{value}</span>
    </div>
  )
}

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [booking, setBooking] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get(`/admin/bookings/${id}`)
      .then((r) => setBooking(r.data))
      .catch(() => setError('예약을 불러올 수 없습니다.'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <p className="text-slate-400">불러오는 중...</p>
  if (error) return <p className="text-red-500">{error}</p>

  const b = booking
  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-slate-400 hover:text-slate-700 text-sm">← 목록</button>
        <h2 className="text-2xl font-bold">예약 상세</h2>
      </div>

      <div className="bg-white rounded-xl shadow p-6 mb-4">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">예약 정보</h3>
        <Row label="예약 ID" value={<span className="font-mono text-xs">{b.id}</span>} />
        <Row label="병원명" value={b.hospitalName} />
        <Row label="병원 주소" value={b.hospitalAddress ?? '-'} />
        <Row label="예약 일시" value={new Date(b.scheduledAt).toLocaleString('ko-KR')} />
        <Row label="예상 시간" value={`${b.estimatedHours}시간`} />
        <Row label="금액" value={`${b.price.toLocaleString()}원`} />
        <Row label="플랫폼 수수료" value={`${b.platformFee?.toLocaleString() ?? '-'}원`} />
        <Row label="매니저 지급액" value={`${b.managerPayout?.toLocaleString() ?? '-'}원`} />
        {b.symptoms && <Row label="증상" value={b.symptoms} />}
        {b.specialNote && <Row label="특이사항" value={b.specialNote} />}
        <Row label="휠체어 필요" value={b.needsWheelchair ? '예' : '아니오'} />
        <Row label="이동 수단" value={TRANSPORT_LABEL[b.transportMode] ?? b.transportMode ?? '-'} />
        {b.transportTotal > 0 && <Row label="교통비" value={`${b.transportTotal.toLocaleString()}원`} />}
        {b.distanceKm && <Row label="이동 거리" value={`${b.distanceKm}km`} />}
        <Row label="상태" value={
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLOR[b.status] ?? 'bg-gray-100 text-gray-800'}`}>
            {STATUS_LABEL[b.status] ?? b.status}
          </span>
        } />
        <Row label="생성일" value={new Date(b.createdAt).toLocaleString('ko-KR')} />
      </div>

      <div className="bg-white rounded-xl shadow p-6 mb-4">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">어르신 정보</h3>
        <Row label="이름" value={b.elder?.user?.name ?? '-'} />
        <Row label="전화번호" value={b.elder?.user?.phone ?? '-'} />
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">매니저 정보</h3>
        {b.manager ? (
          <>
            <Row label="이름" value={b.manager.user?.name ?? '-'} />
            <Row label="전화번호" value={b.manager.user?.phone ?? '-'} />
          </>
        ) : (
          <p className="text-sm text-slate-400">아직 매니저가 배정되지 않았습니다.</p>
        )}
      </div>
    </div>
  )
}
