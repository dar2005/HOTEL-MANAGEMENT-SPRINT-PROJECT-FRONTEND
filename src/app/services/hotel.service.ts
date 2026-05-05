import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Hotel, HotelRequest } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class HotelService {
  private apiUrl = `${environment.apiUrl}/hotels`;

  constructor(private http: HttpClient) { }

  getAllHotels(): Observable<Hotel[]> {
    return this.http.get<Hotel[]>(this.apiUrl);
  }

  getHotelById(id: number): Observable<Hotel> {
    return this.http.get<Hotel>(`${this.apiUrl}/${id}`);
  }

  /**
   * POST /hotels/{id}  — the backend uses the path {id} as the hotelId to create
   */
  createHotel(id: number, dto: HotelRequest): Observable<Hotel> {
    return this.http.post<Hotel>(`${this.apiUrl}/${id}`, dto);
  }

  updateHotel(id: number, dto: HotelRequest): Observable<Hotel> {
    return this.http.put<Hotel>(`${this.apiUrl}/${id}`, dto);
  }

  deleteHotel(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  toggleHotelStatus(id: number, isActive: boolean): Observable<Hotel> {
    const params = new HttpParams().set('isActive', isActive.toString());
    return this.http.put<Hotel>(`${this.apiUrl}/${id}/status`, {}, { params });
  }

  searchByLocation(location: string): Observable<Hotel[]> {
    const params = new HttpParams().set('location', location);
    return this.http.get<Hotel[]>(`${this.apiUrl}/search/location`, { params });
  }

  searchByName(name: string): Observable<Hotel[]> {
    const params = new HttpParams().set('name', name);
    return this.http.get<Hotel[]>(`${this.apiUrl}/search/name`, { params });
  }

  searchByLocationAndName(location: string, name: string): Observable<Hotel[]> {
    const params = new HttpParams().set('location', location).set('name', name);
    return this.http.get<Hotel[]>(`${this.apiUrl}/search`, { params });
  }

  // Admin: Get active/inactive hotels
  getActiveHotels(): Observable<Hotel[]> {
    const params = new HttpParams().set('isActive', 'true');
    return this.http.get<Hotel[]>(`${this.apiUrl}/filter`, { params });
  }

  getInactiveHotels(): Observable<Hotel[]> {
    const params = new HttpParams().set('isActive', 'false');
    return this.http.get<Hotel[]>(`${this.apiUrl}/filter`, { params });
  }
}

