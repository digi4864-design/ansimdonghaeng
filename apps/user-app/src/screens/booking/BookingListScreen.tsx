import React from 'react'
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/api'

const STATUS_LABEL: Record<string, string> = {
  PENDING: '매칭 중',
  MATCHED: '배정 완료',
  IN_PROGRESS: '진행 중',
  COMPLETED: '완료',
  CANCELLED: '취소됨',
}

const STATUS_COLOR: Record<string, string> = {
  PENDING: '#f59e0b',
  MATCHED: '#3b82f6',
  IN_PROGRESS: '#10b981',
  COMPLETED: '#6b7280',
  CANCELLED: '#ef4444',
}

export function BookingListScreen() {
  const queryClient = useQueryClient()
  const { data: bookings, isLoading } = useQuery({
    queryKey: ['my-bookings'],
    queryFn: () => api.get('/bookings/my').then((r) => r.data),
    refetchInterval: 5000,
  })

  const cancelMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/bookings/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-bookings'] }),
  })

  if (isLoading) return <ActivityIndicator style={{ flex: 1 }} color="#2563eb" />

  return (
    <FlatList
      style={styles.container}
      data={bookings ?? []}
      keyExtractor={(item: any) => item.id}
      contentContainerStyle={styles.list}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={styles.emptyText}>예약 내역이 없습니다</Text>
        </View>
      }
      renderItem={({ item }: any) => (
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.hospital}>{item.hospitalName}</Text>
            <View style={[styles.badge, { backgroundColor: STATUS_COLOR[item.status] + '20' }]}>
              <Text style={[styles.badgeText, { color: STATUS_COLOR[item.status] }]}>
                {STATUS_LABEL[item.status] ?? item.status}
              </Text>
            </View>
          </View>
          <Text style={styles.info}>{new Date(item.scheduledAt).toLocaleString('ko-KR')}</Text>
          <Text style={styles.info}>예상 {item.estimatedHours}시간 · {item.price.toLocaleString()}원</Text>
          {item.manager?.user && (
            <Text style={styles.manager}>매니저: {item.manager.user.name}</Text>
          )}
          {(item.status === 'PENDING' || item.status === 'MATCHED') && (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => cancelMutation.mutate(item.id)}
              disabled={cancelMutation.isPending}
            >
              <Text style={styles.cancelText}>예약 취소</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    />
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  list: { padding: 16, gap: 10 },
  empty: { alignItems: 'center', marginTop: 60 },
  emptyText: { color: '#94a3b8', fontSize: 15 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  hospital: { fontSize: 15, fontWeight: '700', color: '#1e293b', flex: 1 },
  badge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  info: { fontSize: 13, color: '#64748b', marginBottom: 2 },
  manager: { fontSize: 13, color: '#065f46', fontWeight: '600', marginTop: 6 },
  cancelButton: { marginTop: 10, borderWidth: 1, borderColor: '#fca5a5', borderRadius: 8, padding: 10, alignItems: 'center' },
  cancelText: { color: '#ef4444', fontSize: 13, fontWeight: '600' },
})
