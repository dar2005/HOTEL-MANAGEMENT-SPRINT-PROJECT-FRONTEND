import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Payment } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = `${environment.apiUrl}/api/payments`;

  constructor(private http: HttpClient) { }

  getAllPayments(): Observable<Payment[]> {
    return this.http.get<Payment[]>(this.apiUrl);
  }

  getPaymentById(id: number): Observable<Payment> {
    return this.http.get<Payment>(`${this.apiUrl}/${id}`);
  }

  getPaymentsByReservation(reservationId: number): Observable<Payment[]> {
    const params = new HttpParams().set('reservationId', reservationId.toString());
    return this.http.get<Payment[]>(`${this.apiUrl}/reservation`, { params });
  }

  createPayment(payment: Payment): Observable<Payment> {
    return this.http.post<Payment>(this.apiUrl, payment);
  }

  updatePayment(id: number, payment: Payment): Observable<Payment> {
    return this.http.put<Payment>(`${this.apiUrl}/${id}`, payment);
  }

  // Admin: Update payment status
  updatePaymentStatus(id: number, status: string): Observable<Payment> {
    const params = new HttpParams().set('status', status);
    return this.http.put<Payment>(`${this.apiUrl}/${id}/status`, {}, { params });
  }

  deletePayment(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // Admin: Filter by status
  filterByStatus(status: string): Observable<Payment[]> {
    const params = new HttpParams().set('status', status);
    return this.http.get<Payment[]>(`${this.apiUrl}/filter/status`, { params });
  }

  // Admin: Filter by date range
  filterByDateRange(startDate: Date | string, endDate: Date | string): Observable<Payment[]> {
    let params = new HttpParams().set('startDate', startDate.toString()).set('endDate', endDate.toString());
    return this.http.get<Payment[]>(`${this.apiUrl}/filter/date-range`, { params });
  }

  // Admin: Get revenue metrics
  getRevenueSummary(): Observable<any> {
    return this.http.get(`${this.apiUrl}/analytics/revenue-summary`);
  }

  // Admin: Get payments for a date range
  getPaymentsByDateRange(startDate: Date | string, endDate: Date | string): Observable<Payment[]> {
    let params = new HttpParams().set('startDate', startDate.toString()).set('endDate', endDate.toString());
    return this.http.get<Payment[]>(`${this.apiUrl}/date-range`, { params });
  }
}
