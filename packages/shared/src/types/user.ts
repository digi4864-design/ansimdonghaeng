export type UserRole = 'ELDER' | 'GUARDIAN' | 'MANAGER' | 'ADMIN'

export interface User {
  id: string
  role: UserRole
  name: string
  phone: string
  email?: string
  profileImageUrl?: string
  createdAt: Date
  updatedAt: Date
}

export interface Elder extends User {
  role: 'ELDER'
  birthYear: number
  address: string
  medicalNote?: string
  needsWheelchair: boolean
  guardianId?: string
}

export interface Guardian extends User {
  role: 'GUARDIAN'
  elderId?: string
}

export interface Manager extends User {
  role: 'MANAGER'
  certifications: Certification[]
  bio: string
  serviceAreas: string[]
  availableHours: AvailableHour[]
  rating: number
  reviewCount: number
  status: ManagerStatus
}

export type ManagerStatus = 'PENDING' | 'APPROVED' | 'SUSPENDED'

export interface Certification {
  type: 'NURSING_ASSISTANT' | 'NURSE' | 'CARE_WORKER' | 'OTHER'
  name: string
  issuedBy: string
  issuedAt: Date
  verified: boolean
}

export interface AvailableHour {
  dayOfWeek: number
  startHour: number
  endHour: number
}
