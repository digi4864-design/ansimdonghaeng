import React from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { api } from '../../lib/api'

export function ManagerHomeScreen({ navigation }: any) {
  const { data: bookings, isLoading } = useQuery({
    queryKey: ['available-bookings'],
    queryFn: () => api.get('/bookings/available').then((r) => r.data),
  })

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>신청 가능한 동행</Text>
      </View>
      {isLoading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#2563eb" />
      ) : (
        <FlatList
          data={bookings ?? []}
          keyExtractor={(item: any) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.empty}>현재 신청 가능한 동행이 없습니다</Text>}
          renderItem={({ item }: any) => (
            <TouchableOpacity
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
          )}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { padding: 24, paddingTop: 48, backgroundColor: '#065f46' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  list: { padding: 16, gap: 12 },
  empty: { textAlign: 'center', color: '#94a3b8', marginTop: 40 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  hospital: { fontSize: 16, fontWeight: '700', color: '#1e293b', marginBottom: 4 },
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
})
