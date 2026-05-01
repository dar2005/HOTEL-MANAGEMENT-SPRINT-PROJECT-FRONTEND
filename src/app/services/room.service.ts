import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Room } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  private apiUrl = `${environment.apiUrl}/rooms`;

  constructor(private http: HttpClient) { }

  createRoom(room: Room, typeId: number): Observable<Room> {
    return this.http.post<Room>(`${this.apiUrl}/${typeId}`, room);
  }

  getAllRooms(): Observable<Room[]> {
    return this.http.get<Room[]>(this.apiUrl);
  }

  getAvailableRooms(): Observable<Room[]> {
    return this.http.get<Room[]>(`${this.apiUrl}/available`);
  }

  getUnavailableRooms(): Observable<Room[]> {
    return this.http.get<Room[]>(`${this.apiUrl}/unavailable`);
  }

  getRoomsByType(typeName: string): Observable<Room[]> {
    return this.http.get<Room[]>(`${this.apiUrl}/type/${typeName}`);
  }

  getRoomsByPrice(min: number, max: number): Observable<Room[]> {
    let params = new HttpParams().set('min', min.toString()).set('max', max.toString());
    return this.http.get<Room[]>(`${this.apiUrl}/price`, { params });
  }

  getById(id: number): Observable<Room> {
    return this.http.get<Room>(`${this.apiUrl}/${id}`);
  }

  updateAvailability(id: number, status: boolean): Observable<Room> {
    let params = new HttpParams().set('status', status.toString());
    return this.http.put<Room>(`${this.apiUrl}/${id}/availability`, {}, { params });
  }

  getByRoomNumber(roomNumber: number): Observable<Room> {
    return this.http.get<Room>(`${this.apiUrl}/number/${roomNumber}`);
  }

  deleteRoom(id: number): Observable<string> {
    return this.http.delete(`${this.apiUrl}/${id}`, { responseType: 'text' });
  }
}
