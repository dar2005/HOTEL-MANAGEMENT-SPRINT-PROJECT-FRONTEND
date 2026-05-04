import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Review } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private apiUrl = `${environment.apiUrl}/reviews`;

  constructor(private http: HttpClient) { }

  getAllReviews(): Observable<Review[]> {
    return this.http.get<Review[]>(this.apiUrl);
  }

  getReviewById(id: number): Observable<Review> {
    return this.http.get<Review>(`${this.apiUrl}/${id}`);
  }

  getReviewsByHotel(hotelId: number): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/hotel/${hotelId}`);
  }

  getReviewsByReservation(reservationId: number): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/reservation/${reservationId}`);
  }

  getReviewsByRating(rating: number): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/rating/${rating}`);
  }

  searchReviews(keyword: string): Observable<Review[]> {
    const params = new HttpParams().set('keyword', keyword);
    return this.http.get<Review[]>(`${this.apiUrl}/search`, { params });
  }

  getLatestReviews(): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/latest`);
  }

  getAverageRating(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/average`);
  }
}
