export interface Review {
  id: string
  bookingId: string
  reviewerId: string
  managerId: string
  rating: number
  comment?: string
  createdAt: Date
}
