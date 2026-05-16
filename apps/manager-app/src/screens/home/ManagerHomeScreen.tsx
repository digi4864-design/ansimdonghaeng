import React, { useCallback } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useFocusEffect } from '@react-navigation/native'
import { api } from '../../lib/api'

const STATUS_LABEL: Record<string, string> = {
  MATCHED: '매칭됨',
  IN_PROGRESS: '진행 중',
  COMPLETED: '완료',
}

const STATUS_COLOR: Record<string, string> = {
  MATCHED: '#2563eb',
  IN_PROGRESS: '#d97706',
  COMPLETED: '#065f46',
}

export function ManagerHomeScreen({ navigation }: any) {
  const queryClient = useQueryClient()

  const { data: available, isLoading: loadingAvailable } = useQuery({
    queryKey: ['available-bookings'],
    queryFn: () => api.get('/bookings/available').then((r) => r.data),
  })

  const { data: myJobs, isLoading: loadingMyJobs } = useQuery({
    queryKey: ['my-jobs'],
    queryFn: () => api.get('/bookings/my-jobs').then((r) => r.data),
  })

  useFocusEffect(
    useCallback(() => {
      queryClient.invalidateQueries({ queryKey: ['available-bookings'] })
      queryClient.invalidateQueries({ queryKey: ['my-jobs'] })
    }, [queryClient])
  )

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>동행 목록</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.sectionTitle}>신청 가능한 동행</Text>
        {loadingAvailable ? (
          <ActivityIndicator style={{ marginVertical: 20 }} color="#065f46" />
        ) : (available ?? []).length === 0 ? (
          <Text style={styles.empty}>현재 신청 가능한 동행이 없습니다</Text>
        ) : (
          (available ?? []).map((item: any) => (
            <TouchableOpacity
              key={item.id}
              style={styles.card}
              onPress={() => navigation.navigate('BookingDetail', { id: item.id })}
            >
              <Text style={styles.hospital}>{item.hospitalName}</Text>
              <Text style={styles.info}>{new Date(item.scheduledAt).toLocaleString('ko-KR')}</Text>
              <Text style={styles.info}>예상 {item.estimatedHours}시간</Text>
              <View style={styles.payRow}>
                <Text style={styles.pay}>매니저 수령: {item.managerPayout.toLocaleString()}원</Text>
                {item.needsWheelchair && <Text style={styles.badge}>휠체어</Text>}
              </View>
            </TouchableOpacity>
          ))
        )}

        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>나의 동행</Text>
        {loadingMyJobs ? (
          <ActivityIndicator style={{ marginVertical: 20 }} color="#065f46" />
        ) : (myJobs ?? []).length === 0 ? (
          <Text style={styles.empty}>진행 중인 동행이 없습니다</Text>
        ) : (
          (myJobs ?? []).map((item: any) => (
            <TouchableOpacity
              key={item.id}
              style={styles.card}
              onPress={() => navigation.navigate('BookingDetail', { id: item.id })}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.hospital}>{item.hospitalName}</Text>
                <Text style={[styles.statusBadge, { backgroundColor: STATUS_COLOR[item.status] ?? '#94a3b8' }]}>
                  {STATUS_LABEL[item.status] ?? item.status}
                </Text>
              </View>
              <Text style={styles.info}>{new Date(item.scheduledAt).toLocaleString('ko-KR')}</Text>
              <Text style={styles.info}>예상 {item.estimatedHours}시간</Text>
              <View style={styles.payRow}>
                <Text style={styles.pay}>매니저 수령: {item.managerPayout.toLocaleString()}원</Text>
                {item.report && <Text style={styles.reportBadge}>리포트 완료</Text>}
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { padding: 24, paddingTop: 48, backgroundColor: '#065f46' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  scroll: { padding: 16, gap: 8, paddingBottom: 40 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#1e293b', marginBottom: 10 },
  empty: { textAlign: 'center', color: '#94a3b8', marginVertical: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 8,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  hospital: { fontSize: 16, fontWeight: '700', color: '#1e293b', marginBottom: 4, flex: 1 },
  info: { fontSize: 13, color: '#64748b', marginBottom: 2 },
  payRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 8 },
  pay: { fontSize: 14, fontWeight: '600', color: '#065f46' },
  badge: {
    backgroundColor: '#dbeafe',
    color: '#1d4ed8',
    fontSize: 11,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
    overflow: 'hidden',
  },
  statusBadge: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    overflow: 'hidden',
  },
  reportBadge: {
    backgroundColor: '#dcfce7',
    color: '#16a34a',
    fontSize: 11,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
    overflow: 'hidden',
  },
})
