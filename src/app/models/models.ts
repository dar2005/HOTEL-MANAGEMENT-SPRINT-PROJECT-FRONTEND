export interface Hotel {
  hotelId?: number;
  name: string;
  location: string;
  description: string;
}

export interface HotelRequest {
  name: string;
  location: string;
  description: string;
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
  // Optional relations
  room?: Room;
}

export interface Payment {
  paymentId?: number;
  reservationId: number;
  amount: number;
  paymentDate: Date | string;
  paymentStatus: string;
}

export interface Review {
  reviewId?: number;
  reservationId: number;
  rating: number;
  comment: string;
  reviewDate: Date | string;
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
