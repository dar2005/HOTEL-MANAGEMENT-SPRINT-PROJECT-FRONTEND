export interface Hotel {
  hotelId?: number;
  name: string;
  location: string;
  description: string;
  isActive?: boolean; // For admin to toggle availability
  imageUrl?: string; // Hotel image URL
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface HotelRequest {
  name: string;
  location: string;
  description: string;
  isActive?: boolean;
  imageUrl?: string;
}

export interface RoomType {
  roomTypeId?: number;
  typeName: string;
  description: string;
  maxOccupancy: number;
  pricePerNight: number;
}

export interface Room {
  roomId?: number;
  roomNumber: number;
  roomTypeId: number;
  isAvailable: boolean;
  hotelId?: number; // To associate room with hotel
  createdAt?: Date | string;
  updatedAt?: Date | string;
  // Optional relations
  roomType?: RoomType;
}

export interface Amenity {
  amenityId?: number;
  name: string;
  description: string;
}

export interface Reservation {
  reservationId?: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkInDate: Date | string;
  checkOutDate: Date | string;
  roomId: number;
  totalPrice?: number;
  status?: string; // 'CONFIRMED', 'CANCELLED', 'COMPLETED'
  userId?: number; // To track who made the booking
  createdAt?: Date | string;
  updatedAt?: Date | string;
  // Optional relations
  room?: Room;
  hotel?: Hotel;
}

export interface Payment {
  paymentId?: number;
  reservationId: number;
  amount: number;
  paymentDate: Date | string;
  paymentStatus: string; // 'PENDING', 'COMPLETED', 'FAILED'
  paymentMethod?: string; // 'CREDIT_CARD', 'DEBIT_CARD', 'PAYPAL'
  transactionId?: string;
  createdAt?: Date | string;
}

export interface Review {
  reviewId?: number;
  reservationId: number;
  rating: number;
  comment: string;
  reviewDate: Date | string;
  userId?: number;
  hotelId?: number;
}

export interface LoginRequest {
  username?: string;
  email?: string;
  password?: string;
}

export interface RegisterRequest {
  username?: string;
  email?: string;
  password?: string;
  phone?: string;
}

export interface AuthResponse {
  token: string;
  role?: string;
}

export interface User {
  userId?: number;
  username: string;
  email: string;
  phone?: string;
  role?: string;
  createdAt?: Date | string;
}

// Admin filter models
export interface BookingFilter {
  startDate?: Date | string;
  endDate?: Date | string;
  userId?: number;
  hotelId?: number;
  status?: string;
}

export interface RoomStatusUpdate {
  roomIds: number[];
  isAvailable: boolean;
}
