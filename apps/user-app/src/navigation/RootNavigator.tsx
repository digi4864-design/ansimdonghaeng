import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createStackNavigator } from '@react-navigation/stack'
import { HomeScreen } from '../screens/home/HomeScreen'
import { BookingCreateScreen } from '../screens/booking/BookingCreateScreen'
import { BookingListScreen } from '../screens/booking/BookingListScreen'
import { ProfileScreen } from '../screens/profile/ProfileScreen'

const Tab = createBottomTabNavigator()
const Stack = createStackNavigator()

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen
        name="BookingCreate"
        component={BookingCreateScreen}
        options={{ headerShown: true, title: '동행 신청' }}
      />
    </Stack.Navigator>
  )
}

function BookingStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="BookingList" component={BookingListScreen} options={{ headerShown: true, title: '예약 내역' }} />
    </Stack.Navigator>
  )
}

export function RootNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator screenOptions={{ headerShown: false, tabBarActiveTintColor: '#2563eb' }}>
        <Tab.Screen name="홈" component={HomeStack} />
        <Tab.Screen name="예약내역" component={BookingStack} />
        <Tab.Screen name="프로필" component={ProfileScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  )
}
