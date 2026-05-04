import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { RoomType } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class RoomTypeService {
  private apiUrl = `${environment.apiUrl}/roomtypes`;

  constructor(private http: HttpClient) { }

  getAllRoomTypes(): Observable<RoomType[]> {
    return this.http.get<RoomType[]>(this.apiUrl);
  }

  getRoomTypeById(id: number): Observable<RoomType> {
    return this.http.get<RoomType>(`${this.apiUrl}/${id}`);
  }

  getRoomTypeByName(name: string): Observable<RoomType> {
    return this.http.get<RoomType>(`${this.apiUrl}/name/${name}`);
  }

  createRoomType(roomType: RoomType): Observable<RoomType> {
    return this.http.post<RoomType>(this.apiUrl, roomType);
  }

  updateRoomType(id: number, roomType: RoomType): Observable<RoomType> {
    return this.http.put<RoomType>(`${this.apiUrl}/${id}`, roomType);
  }

  deleteRoomType(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
