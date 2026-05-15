'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

const ROLE_LABEL: Record<string, string> = {
  ELDER: '어르신',
  GUARDIAN: '보호자',
  MANAGER: '매니저',
  ADMIN: '관리자',
}

export default function UsersPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/users')
      .then((r) => setData(r.data))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">회원 관리</h2>
      {loading ? (
        <p className="text-slate-400">불러오는 중...</p>
      ) : (
        <>
          <p className="text-sm text-slate-500 mb-4">총 {data?.total ?? 0}명</p>
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b">
                <tr>
                  {['이름', '전화번호', '이메일', '역할', '가입일'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-slate-600 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(data?.users ?? []).map((u: any) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium">{u.name || '-'}</td>
                    <td className="px-4 py-3 text-slate-600">{u.phone}</td>
                    <td className="px-4 py-3 text-slate-600">{u.email ?? '-'}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                        {ROLE_LABEL[u.role] ?? u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {new Date(u.createdAt).toLocaleDateString('ko-KR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data?.users?.length === 0 && (
              <p className="text-center text-slate-400 py-12">회원이 없습니다</p>
            )}
          </div>
        </>
      )}
    </div>
  )
}
