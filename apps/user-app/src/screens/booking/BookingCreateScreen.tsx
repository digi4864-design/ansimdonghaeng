import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Switch, Alert } from 'react-native'
import { api } from '../../lib/api'

type TransportMode = 'TAXI' | 'MANAGER_CAR' | 'PUBLIC_TRANSIT' | 'WALKING'

const TRANSPORT_OPTIONS: { mode: TransportMode; label: string; desc: string }[] = [
  { mode: 'TAXI', label: '택시', desc: '실비 청구' },
  { mode: 'MANAGER_CAR', label: '매니저 자가용', desc: '거리당 1,000원 (택시보다 저렴)' },
  { mode: 'PUBLIC_TRANSIT', label: '대중교통', desc: '실비 × 2' },
  { mode: 'WALKING', label: '도보', desc: '추가 비용 없음' },
]

export function BookingCreateScreen({ navigation }: any) {
  const [form, setForm] = useState({
    hospitalName: '',
    hospitalAddress: '',
    scheduledAt: '',
    estimatedHours: '3',
    symptoms: '',
    needsWheelchair: false,
    specialNote: '',
    price: '35000',
    transportMode: 'WALKING' as TransportMode,
  })
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    if (!form.hospitalName || !form.hospitalAddress || !form.scheduledAt) {
      Alert.alert('입력 오류', '병원명, 병원 주소, 예약 일시는 필수 항목입니다.')
      return
    }
    setLoading(true)
    try {
      await api.post('/bookings', {
        ...form,
        scheduledAt: new Date(form.scheduledAt),
        estimatedHours: parseInt(form.estimatedHours),
        price: parseInt(form.price),
      })
      navigation.navigate('Home')
    } catch (e: any) {
      Alert.alert('신청 실패', e?.response?.data?.message ?? '다시 시도해 주세요.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>병원 동행 신청</Text>

      {([
        ['hospitalName', '병원명', '예: 서울대학교병원'],
        ['hospitalAddress', '병원 주소', '예: 서울 종로구 대학로 101'],
        ['scheduledAt', '예약 일시', '예: 2026-06-01T10:00'],
        ['symptoms', '증상 및 진료과', '예: 무릎 통증, 정형외과'],
        ['specialNote', '특이사항', '선택사항'],
      ] as [keyof typeof form, string, string][]).map(([key, label, placeholder]) => (
        <View key={key} style={styles.field}>
          <Text style={styles.label}>{label}</Text>
          <TextInput
            style={styles.input}
            placeholder={placeholder}
            value={String(form[key])}
            onChangeText={(v) => setForm((f) => ({ ...f, [key]: v }))}
          />
        </View>
      ))}

      <View style={styles.field}>
        <Text style={styles.label}>휠체어 필요 여부</Text>
        <Switch
          value={form.needsWheelchair}
          onValueChange={(v) => setForm((f) => ({ ...f, needsWheelchair: v }))}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>이동 수단</Text>
        <View style={styles.transportGrid}>
          {TRANSPORT_OPTIONS.map(({ mode, label, desc }) => (
            <TouchableOpacity
              key={mode}
              style={[styles.transportOption, form.transportMode === mode && styles.transportSelected]}
              onPress={() => setForm((f) => ({ ...f, transportMode: mode }))}
            >
              <Text style={[styles.transportLabel, form.transportMode === mode && styles.transportLabelSelected]}>
                {label}
              </Text>
              <Text style={[styles.transportDesc, form.transportMode === mode && styles.transportDescSelected]}>
                {desc}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={submit} disabled={loading}>
        <Text style={styles.submitText}>{loading ? '신청 중...' : '신청하기'}</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 24, color: '#1e293b' },
  field: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#475569', marginBottom: 6 },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
  },
  transportGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  transportOption: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    padding: 12,
  },
  transportSelected: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  transportLabel: { fontSize: 14, fontWeight: '700', color: '#334155', marginBottom: 2 },
  transportLabelSelected: { color: '#1d4ed8' },
  transportDesc: { fontSize: 11, color: '#94a3b8' },
  transportDescSelected: { color: '#3b82f6' },
  submitButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  submitText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
})
