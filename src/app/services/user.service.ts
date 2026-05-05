import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { User } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/api/users`;

  constructor(private http: HttpClient) { }

  // Admin: Get all users
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  // Admin: Search users
  searchUsers(keyword: string): Observable<User[]> {
    const params = new HttpParams().set('keyword', keyword);
    return this.http.get<User[]>(`${this.apiUrl}/search`, { params });
  }

  // Admin: Filter users by role
  getUsersByRole(role: string): Observable<User[]> {
    const params = new HttpParams().set('role', role);
    return this.http.get<User[]>(`${this.apiUrl}/filter/role`, { params });
  }

  // Admin: Get user activity/stats
  getUserStats(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${userId}/stats`);
  }
}
