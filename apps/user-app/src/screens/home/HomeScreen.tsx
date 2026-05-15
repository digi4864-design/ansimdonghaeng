import React from 'react'
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { api } from '../../lib/api'

const STATUS_LABEL: Record<string, string> = {
  PENDING: '매니저 매칭 중',
  MATCHED: '매니저 배정 완료',
  IN_PROGRESS: '동행 진행 중',
  COMPLETED: '완료',
  CANCELLED: '취소됨',
}

const STEP_LABEL: Record<string, string> = {
  DEPARTED: '출발',
  ARRIVED_HOSPITAL: '병원 도착',
  IN_TREATMENT: '진료 중',
  TREATMENT_DONE: '진료 완료',
  RETURNING: '귀가 중',
  COMPLETED: '완료',
}

export function HomeScreen({ navigation }: any) {
  const { data: bookings, isLoading } = useQuery({
    queryKey: ['my-bookings'],
    queryFn: () => api.get('/bookings/my').then((r) => r.data),
    refetchInterval: 5000,
  })

  const activeBookings = (bookings ?? []).filter(
    (b: any) => b.status === 'PENDING' || b.status === 'MATCHED' || b.status === 'IN_PROGRESS',
  )
  const recentBookings = (bookings ?? [])
    .filter((b: any) => b.status === 'COMPLETED' || b.status === 'CANCELLED')
    .slice(0, 3)

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>안녕하세요 👋</Text>
        <Text style={styles.subtitle}>오늘도 안심동행이 함께합니다</Text>
      </View>

      <TouchableOpacity
        style={styles.bookingButton}
        onPress={() => navigation.navigate('BookingCreate')}
      >
        <Text style={styles.bookingButtonText}>+ 병원 동행 신청하기</Text>
      </TouchableOpacity>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>진행 중인 예약</Text>
        {isLoading ? (
          <ActivityIndicator color="#2563eb" style={{ marginTop: 16 }} />
        ) : activeBookings.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>진행 중인 예약이 없습니다</Text>
          </View>
        ) : (
          activeBookings.map((b: any) => (
            <View key={b.id} style={styles.activeCard}>
              <Text style={styles.cardHospital}>{b.hospitalName}</Text>
              <Text style={styles.cardDate}>{new Date(b.scheduledAt).toLocaleString('ko-KR')}</Text>
              <View style={styles.statusRow}>
                <View style={[styles.statusBadge, b.status === 'IN_PROGRESS' && styles.statusBadgeGreen]}>
                  <Text style={styles.statusText}>{STATUS_LABEL[b.status] ?? b.status}</Text>
                </View>
                {b.currentStep && (
                  <Text style={styles.stepText}>현재: {STEP_LABEL[b.currentStep] ?? b.currentStep}</Text>
                )}
              </View>
            </View>
          ))
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>최근 예약 내역</Text>
        {isLoading ? (
          <ActivityIndicator color="#2563eb" style={{ marginTop: 16 }} />
        ) : recentBookings.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>예약 내역이 없습니다</Text>
          </View>
        ) : (
          recentBookings.map((b: any) => (
            <View key={b.id} style={styles.recentCard}>
              <Text style={styles.cardHospital}>{b.hospitalName}</Text>
              <Text style={styles.cardDate}>{new Date(b.scheduledAt).toLocaleString('ko-KR')}</Text>
              <Text style={[styles.statusText, b.status === 'CANCELLED' && { color: '#ef4444' }]}>
                {STATUS_LABEL[b.status] ?? b.status}
              </Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { padding: 24, paddingTop: 48, backgroundColor: '#1e40af' },
  greeting: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  subtitle: { fontSize: 14, color: '#bfdbfe', marginTop: 4 },
  bookingButton: { margin: 16, backgroundColor: '#2563eb', borderRadius: 12, padding: 18, alignItems: 'center' },
  bookingButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  section: { paddingHorizontal: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#1e293b' },
  emptyCard: { backgroundColor: '#fff', borderRadius: 12, padding: 24, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  emptyText: { color: '#94a3b8', fontSize: 14 },
  activeCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 8, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, elevation: 2, borderLeftWidth: 4, borderLeftColor: '#2563eb' },
  recentCard: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 8, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 3, elevation: 1 },
  cardHospital: { fontSize: 15, fontWeight: '700', color: '#1e293b', marginBottom: 2 },
  cardDate: { fontSize: 13, color: '#64748b', marginBottom: 6 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusBadge: { backgroundColor: '#dbeafe', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  statusBadgeGreen: { backgroundColor: '#d1fae5' },
  statusText: { fontSize: 12, color: '#1d4ed8', fontWeight: '600' },
  stepText: { fontSize: 12, color: '#64748b' },
})
