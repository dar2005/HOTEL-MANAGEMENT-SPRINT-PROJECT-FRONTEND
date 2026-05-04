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
  room_type_id?: number;
  type_name: string;
  description: string;
  max_occupancy: number;
  price_per_night: number;
}

export interface Room {
  room_id?: number;
  room_number: number;
  room_type_id: number;
  is_available: boolean;
  // Optional relations
  roomType?: RoomType;
}

export interface Amenity {
  amenity_id?: number;
  name: string;
  description: string;
}

export interface Reservation {
  reservation_id?: number;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  check_in_date: Date | string;
  check_out_date: Date | string;
  room_id: number;
  total_price?: number;
  // Optional relations
  room?: Room;
}

export interface Payment {
  payment_id?: number;
  reservation_id: number;
  amount: number;
  payment_date: Date | string;
  payment_status: string;
}

export interface Review {
  review_id?: number;
  reservation_id: number;
  rating: number;
  comment: string;
  review_date: Date | string;
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
