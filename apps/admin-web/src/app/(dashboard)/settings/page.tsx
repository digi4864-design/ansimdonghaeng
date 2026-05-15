'use client'
import { useState, useEffect } from 'react'

export default function SettingsPage() {
  const [token, setToken] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const existing = localStorage.getItem('admin_token')
    if (existing) setToken(existing)
  }, [])

  const save = () => {
    localStorage.setItem('admin_token', token.trim())
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const clear = () => {
    localStorage.removeItem('admin_token')
    setToken('')
  }

  return (
    <div className="max-w-xl">
      <h2 className="text-2xl font-bold mb-6">설정</h2>
      <div className="bg-white rounded-xl shadow p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">관리자 액세스 토큰</label>
          <textarea
            value={token}
            onChange={(e) => setToken(e.target.value)}
            rows={4}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="JWT 토큰을 붙여넣으세요..."
          />
          <p className="text-xs text-slate-500 mt-1">
            POST /api/v1/auth/phone 으로 role=ADMIN 토큰 발급 후 입력
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={save}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
          >
            {saved ? '저장됨!' : '저장'}
          </button>
          <button
            onClick={clear}
            className="px-4 py-2 bg-slate-200 text-slate-700 text-sm rounded-lg hover:bg-slate-300"
          >
            초기화
          </button>
        </div>
      </div>
    </div>
  )
}
