import React from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../../lib/AuthContext'
import { api } from '../../lib/api'

export function ProfileScreen() {
  const { logout } = useAuth()
  const { data: user, isLoading } = useQuery({
    queryKey: ['my-profile'],
    queryFn: () => api.get('/users/me').then((r) => r.data),
  })

  if (isLoading) return <ActivityIndicator style={{ flex: 1 }} color="#2563eb" />

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.name?.charAt(0) || '?'}</Text>
        </View>
        <Text style={styles.name}>{user?.name || '-'}</Text>
        <Text style={styles.phone}>{user?.phone ?? '-'}</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.row}>
          <Text style={styles.label}>이름</Text>
          <Text style={styles.value}>{user?.name || '-'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>전화번호</Text>
          <Text style={styles.value}>{user?.phone ?? '-'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>이메일</Text>
          <Text style={styles.value}>{user?.email ?? '-'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>역할</Text>
          <Text style={styles.value}>{user?.role === 'ELDER' ? '어르신' : '보호자'}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={() => logout()}>
        <Text style={styles.logoutText}>로그아웃</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { backgroundColor: '#1e40af', padding: 32, alignItems: 'center', paddingTop: 56 },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarText: { fontSize: 28, fontWeight: 'bold', color: '#1e40af' },
  name: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  phone: { fontSize: 14, color: '#bfdbfe', marginTop: 4 },
  section: { backgroundColor: '#fff', margin: 16, borderRadius: 12, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  label: { fontSize: 14, color: '#64748b' },
  value: { fontSize: 14, color: '#1e293b', fontWeight: '500' },
  logoutButton: { margin: 16, borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 16, alignItems: 'center' },
  logoutText: { color: '#64748b', fontSize: 15 },
})
