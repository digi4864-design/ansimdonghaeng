import React, { useState } from 'react'
import {
  View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert,
} from 'react-native'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/api'

const STEPS = [
  { key: 'DEPARTED', label: '출발' },
  { key: 'ARRIVED_HOSPITAL', label: '병원 도착' },
  { key: 'IN_TREATMENT', label: '진료 중' },
  { key: 'TREATMENT_DONE', label: '진료 완료' },
  { key: 'RETURNING', label: '귀가 중' },
  { key: 'COMPLETED', label: '완료' },
]

const TRANSPORT_LABEL: Record<string, string> = {
  TAXI: '택시',
  MANAGER_CAR: '매니저 자가용',
  PUBLIC_TRANSIT: '대중교통',
  WALKING: '도보',
}

export function BookingDetailScreen({ route, navigation }: any) {
  const { id } = route.params
  const queryClient = useQueryClient()
  const [reportForm, setReportForm] = useState({ summary: '' })
  const [showReport, setShowReport] = useState(false)
  const [transportCost, setTransportCost] = useState('')
  const [distanceKm, setDistanceKm] = useState('')
  const [transportSubmitted, setTransportSubmitted] = useState(false)

  const { data: booking, isLoading } = useQuery({
    queryKey: ['booking', id],
    queryFn: () => api.get(`/bookings/${id}`).then((r) => r.data),
    refetchOnMount: 'always',
  })

  const applyMutation = useMutation({
    mutationFn: () => api.post(`/bookings/${id}/apply`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['booking', id] })
      queryClient.invalidateQueries({ queryKey: ['available-bookings'] })
    },
  })

  const stepMutation = useMutation({
    mutationFn: (step: string) => api.patch(`/bookings/${id}/step`, { step }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['booking', id] }),
  })

  const transportMutation = useMutation({
    mutationFn: () => {
      const body: any = {}
      if (transportCost) body.transportCost = parseInt(transportCost)
      if (distanceKm) body.distanceKm = parseFloat(distanceKm)
      return api.patch(`/bookings/${id}/transport`, body)
    },
    onSuccess: () => {
      setTransportSubmitted(true)
      queryClient.invalidateQueries({ queryKey: ['booking', id] })
      Alert.alert('완료', '교통비가 기록되었습니다.')
    },
  })

  const reportMutation = useMutation({
    mutationFn: () => api.post(`/bookings/${id}/report`, reportForm),
    onSuccess: () => {
      setShowReport(false)
      queryClient.invalidateQueries({ queryKey: ['booking', id] })
      Alert.alert('완료', '진료 리포트가 제출되었습니다.')
    },
  })

  if (isLoading) return <ActivityIndicator style={{ flex: 1 }} color="#065f46" />
  if (!booking) return null

  const isPending = booking.status === 'PENDING'
  const isMatched = booking.status === 'MATCHED' || booking.status === 'IN_PROGRESS'
  const isCompleted = booking.status === 'COMPLETED'
  const mode = booking.transportMode ?? 'WALKING'
  const needsCost = mode === 'TAXI' || mode === 'PUBLIC_TRANSIT'
  const needsDistance = mode === 'MANAGER_CAR'
  const alreadyHasTransport = booking.transportTotal > 0 || transportSubmitted

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
      <View style={styles.card}>
        <Text style={styles.hospital}>{booking.hospitalName}</Text>
        <Text style={styles.address}>{booking.hospitalAddress}</Text>
        <Text style={styles.info}>{new Date(booking.scheduledAt).toLocaleString('ko-KR')}</Text>
        <Text style={styles.info}>예상 {booking.estimatedHours}시간</Text>
        {booking.symptoms && <Text style={styles.info}>증상: {booking.symptoms}</Text>}
        {booking.needsWheelchair && <Text style={styles.badge}>휠체어 필요</Text>}
        {booking.specialNote && <Text style={styles.note}>특이사항: {booking.specialNote}</Text>}
        <View style={styles.transportRow}>
          <Text style={styles.transportBadge}>{TRANSPORT_LABEL[mode] ?? mode}</Text>
          {booking.transportTotal > 0 && (
            <Text style={styles.transportTotal}>교통비 {booking.transportTotal.toLocaleString()}원</Text>
          )}
        </View>
        <Text style={styles.payout}>매니저 수령: {booking.managerPayout?.toLocaleString()}원</Text>
      </View>

      {booking.elder?.user && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>어르신 정보</Text>
          <Text style={styles.info}>{booking.elder.user.name}</Text>
          <Text style={styles.info}>{booking.elder.user.phone}</Text>
        </View>
      )}

      {isPending && (
        <TouchableOpacity
          style={styles.applyButton}
          onPress={() => applyMutation.mutate()}
          disabled={applyMutation.isPending}
        >
          <Text style={styles.buttonText}>{applyMutation.isPending ? '신청 중...' : '동행 신청하기'}</Text>
        </TouchableOpacity>
      )}

      {isMatched && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>단계 업데이트</Text>
          <View style={styles.stepGrid}>
            {STEPS.map((s) => (
              <TouchableOpacity
                key={s.key}
                style={[styles.stepBtn, booking.currentStep === s.key && styles.stepBtnActive]}
                onPress={() => stepMutation.mutate(s.key)}
                disabled={stepMutation.isPending}
              >
                <Text style={[styles.stepText, booking.currentStep === s.key && styles.stepTextActive]}>
                  {s.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {(isMatched || isCompleted) && mode !== 'WALKING' && !alreadyHasTransport && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>교통비 입력</Text>
          <Text style={styles.transportHint}>
            {mode === 'TAXI' && '택시 실비를 입력하세요'}
            {mode === 'PUBLIC_TRANSIT' && '대중교통 실비를 입력하세요 (어르신에게 2배 청구됩니다)'}
            {mode === 'MANAGER_CAR' && '이동 거리(km)를 입력하세요 (1,000원/km 적용)'}
          </Text>
          {needsCost && (
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="교통비 (원)"
              value={transportCost}
              onChangeText={setTransportCost}
            />
          )}
          {needsDistance && (
            <TextInput
              style={styles.input}
              keyboardType="decimal-pad"
              placeholder="이동 거리 (km)"
              value={distanceKm}
              onChangeText={setDistanceKm}
            />
          )}
          <TouchableOpacity
            style={styles.applyButton}
            onPress={() => transportMutation.mutate()}
            disabled={transportMutation.isPending}
          >
            <Text style={styles.buttonText}>{transportMutation.isPending ? '저장 중...' : '교통비 저장'}</Text>
          </TouchableOpacity>
        </View>
      )}

      {(isMatched || isCompleted) && !booking.report && (
        <>
          {!showReport ? (
            <TouchableOpacity style={styles.reportButton} onPress={() => setShowReport(true)}>
              <Text style={styles.buttonText}>진료 리포트 작성</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>진료 리포트</Text>
              <Text style={styles.label}>진료 요약</Text>
              <TextInput
                style={styles.textArea}
                multiline
                numberOfLines={4}
                placeholder="진료 내용을 입력하세요..."
                value={reportForm.summary}
                onChangeText={(v) => setReportForm({ summary: v })}
                textAlignVertical="top"
              />
              <TouchableOpacity
                style={styles.applyButton}
                onPress={() => reportMutation.mutate()}
                disabled={reportMutation.isPending}
              >
                <Text style={styles.buttonText}>{reportMutation.isPending ? '제출 중...' : '리포트 제출'}</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}

      {isCompleted && booking.report && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>진료 리포트</Text>
          <Text style={styles.info}>{booking.report.summary}</Text>
          {booking.report.medications && <Text style={styles.info}>약 처방: {booking.report.medications}</Text>}
          {booking.report.doctorInstructions && (
            <Text style={styles.info}>의사 지시: {booking.report.doctorInstructions}</Text>
          )}
        </View>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 16, gap: 12 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  hospital: { fontSize: 18, fontWeight: '700', color: '#1e293b', marginBottom: 4 },
  address: { fontSize: 13, color: '#64748b', marginBottom: 8 },
  info: { fontSize: 14, color: '#475569', marginBottom: 4 },
  badge: { backgroundColor: '#dbeafe', color: '#1d4ed8', fontSize: 12, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, overflow: 'hidden', alignSelf: 'flex-start', marginBottom: 8 },
  note: { fontSize: 13, color: '#94a3b8', marginTop: 4 },
  transportRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  transportBadge: { backgroundColor: '#f1f5f9', color: '#475569', fontSize: 12, fontWeight: '600', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, overflow: 'hidden' },
  transportTotal: { fontSize: 13, color: '#d97706', fontWeight: '600' },
  transportHint: { fontSize: 13, color: '#64748b', marginBottom: 10 },
  payout: { fontSize: 16, fontWeight: '700', color: '#065f46', marginTop: 8 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#1e293b', marginBottom: 10 },
  applyButton: { backgroundColor: '#065f46', borderRadius: 12, padding: 16, alignItems: 'center' },
  reportButton: { backgroundColor: '#1d4ed8', borderRadius: 12, padding: 16, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  stepGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  stepBtn: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  stepBtnActive: { backgroundColor: '#065f46', borderColor: '#065f46' },
  stepText: { fontSize: 13, color: '#64748b' },
  stepTextActive: { color: '#fff', fontWeight: '600' },
  label: { fontSize: 13, fontWeight: '600', color: '#475569', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, padding: 12, fontSize: 14, marginBottom: 10 },
  textArea: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, padding: 12, minHeight: 80, marginBottom: 12, fontSize: 14, color: '#1e293b' },
})
