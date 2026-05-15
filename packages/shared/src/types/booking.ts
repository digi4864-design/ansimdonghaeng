export type BookingStatus =
  | 'PENDING'
  | 'MATCHED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'

export type BookingStep =
  | 'DEPARTED'
  | 'ARRIVED_HOSPITAL'
  | 'IN_TREATMENT'
  | 'TREATMENT_DONE'
  | 'RETURNING'
  | 'COMPLETED'

export interface Booking {
  id: string
  elderId: string
  guardianId?: string
  managerId?: string
  status: BookingStatus
  currentStep?: BookingStep

  hospitalName: string
  hospitalAddress: string
  scheduledAt: Date
  estimatedHours: number

  symptoms?: string
  needsWheelchair: boolean
  specialNote?: string

  price: number
  platformFee: number
  managerPayout: number

  report?: TreatmentReport
  createdAt: Date
  updatedAt: Date
}

export interface TreatmentReport {
  id: string
  bookingId: string
  managerId: string
  summary: string
  nextAppointment?: Date
  medications?: string
  doctorInstructions?: string
  createdAt: Date
}

export interface BookingCreateInput {
  hospitalName: string
  hospitalAddress: string
  scheduledAt: Date
  estimatedHours: number
  symptoms?: string
  needsWheelchair: boolean
  specialNote?: string
}
