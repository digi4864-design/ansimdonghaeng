import { useState, useEffect } from 'react'
import { ActivityIndicator, View } from 'react-native'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RootNavigator } from './src/navigation/RootNavigator'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { AuthContext } from './src/lib/AuthContext'
import axios from 'axios'

const queryClient = new QueryClient()

async function devAutoLogin() {
  const existing = await AsyncStorage.getItem('access_token')
  if (existing) return
  const res = await axios.post('http://10.0.2.2:3000/api/v1/auth/phone', {
    phone: '01099990001',
    role: 'MANAGER',
  })
  await AsyncStorage.setItem('access_token', res.data.accessToken)
}

export default function App() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    devAutoLogin().finally(() => setReady(true))
  }, [])

  const logout = async () => {
    await AsyncStorage.removeItem('access_token')
    queryClient.clear()
    setReady(false)
    devAutoLogin().finally(() => setReady(true))
  }

  if (!ready) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#065f46" />
      </View>
    )
  }

  return (
    <AuthContext.Provider value={{ logout }}>
      <QueryClientProvider client={queryClient}>
        <RootNavigator />
      </QueryClientProvider>
    </AuthContext.Provider>
  )
}
