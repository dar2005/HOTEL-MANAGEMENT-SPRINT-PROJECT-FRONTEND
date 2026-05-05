import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Reservation, BookingFilter } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  private apiUrl = `${environment.apiUrl}/api/reservations`;

  constructor(private http: HttpClient) { }

  getAllReservations(): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(this.apiUrl);
  }

  getReservationById(id: number): Observable<Reservation> {
    return this.http.get<Reservation>(`${this.apiUrl}/${id}`);
  }

  createReservation(reservation: Reservation): Observable<Reservation> {
    return this.http.post<Reservation>(this.apiUrl, reservation);
  }

  updateReservation(id: number, reservation: Reservation): Observable<Reservation> {
    return this.http.put<Reservation>(`${this.apiUrl}/${id}`, reservation);
  }

  deleteReservation(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // Admin: Cancel reservation
  cancelReservation(id: number): Observable<Reservation> {
    return this.http.put<Reservation>(`${this.apiUrl}/${id}/cancel`, {});
  }

  // Admin: Update reservation status
  updateReservationStatus(id: number, status: string): Observable<Reservation> {
    const params = new HttpParams().set('status', status);
    return this.http.put<Reservation>(`${this.apiUrl}/${id}/status`, {}, { params });
  }

  // Admin: Filter bookings by date range
  filterByDateRange(startDate: Date | string, endDate: Date | string): Observable<Reservation[]> {
    let params = new HttpParams().set('startDate', startDate.toString()).set('endDate', endDate.toString());
    return this.http.get<Reservation[]>(`${this.apiUrl}/filter/date-range`, { params });
  }

  // Admin: Filter bookings by hotel
  filterByHotel(hotelId: number): Observable<Reservation[]> {
    const params = new HttpParams().set('hotelId', hotelId.toString());
    return this.http.get<Reservation[]>(`${this.apiUrl}/filter/hotel`, { params });
  }

  // Admin: Filter bookings by user
  filterByUser(userId: number): Observable<Reservation[]> {
    const params = new HttpParams().set('userId', userId.toString());
    return this.http.get<Reservation[]>(`${this.apiUrl}/filter/user`, { params });
  }

  // Admin: Filter bookings by status
  filterByStatus(status: string): Observable<Reservation[]> {
    const params = new HttpParams().set('status', status);
    return this.http.get<Reservation[]>(`${this.apiUrl}/filter/status`, { params });
  }

  // Admin: Advanced filter
  advancedFilter(filter: BookingFilter): Observable<Reservation[]> {
    let params = new HttpParams();
    if (filter.startDate) params = params.set('startDate', filter.startDate.toString());
    if (filter.endDate) params = params.set('endDate', filter.endDate.toString());
    if (filter.userId) params = params.set('userId', filter.userId.toString());
    if (filter.hotelId) params = params.set('hotelId', filter.hotelId.toString());
    if (filter.status) params = params.set('status', filter.status);
    return this.http.get<Reservation[]>(`${this.apiUrl}/filter/advanced`, { params });
  }
}

