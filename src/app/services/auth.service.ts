import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';
import { LoginRequest, RegisterRequest, AuthResponse } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;

  // Track authentication status
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient) { }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, request).pipe(
      tap(response => {
        if (response && response.token) {
          this.setToken(response.token);
          if (response.role) this.setRole(response.role);
          if (response.username) localStorage.setItem('username', response.username);
          if (response.email) localStorage.setItem('email', response.email);

          // Save username from the login request
          if (!response.username && request.username) {
            localStorage.setItem('username', request.username);
          } else if (!response.username && request.email) {
            // Use part before @ as display name
            localStorage.setItem('username', request.email.split('@')[0]);
          }

          // Try to decode JWT to extract extra claims (sub / username)
          try {
            const payload = JSON.parse(atob(response.token.split('.')[1]));
            if (payload.sub) {
              localStorage.setItem('username', payload.sub);
            }
            if (payload.email) {
              localStorage.setItem('email', payload.email);
            }
            if (payload.iat) {
              const year = new Date(payload.iat * 1000).getFullYear().toString();
              localStorage.setItem('memberSince', year);
            }
          } catch (e) {
            // JWT decode failed – silently ignore, username already set above
          }

          this.isAuthenticatedSubject.next(true);
        }
      })
    );
  }

  register(request: RegisterRequest): Observable<string> {
    // The backend returns a String for register
    return this.http.post(`${this.apiUrl}/register`, request, { responseType: 'text' });
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    localStorage.removeItem('email');
    localStorage.removeItem('memberSince');
    localStorage.removeItem('lastBookingGuestName');
    localStorage.removeItem('lastBookingGuestEmail');
    localStorage.removeItem('bookingIdentities');
    this.isAuthenticatedSubject.next(false);
  }

  private setToken(token: string): void {
    localStorage.setItem('token', token);
  }

  private setRole(role: string): void {
    localStorage.setItem('role', this.cleanRole(role));
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getRole(): string | null {
    const role = localStorage.getItem('role');
    return role ? this.cleanRole(role) : null;
  }

  getUsername(): string | null {
    return localStorage.getItem('username');
  }

  private hasToken(): boolean {
    return !!this.getToken();
  }

  private cleanRole(role: string): string {
    return role.replace('ROLE_', '').toUpperCase();
  }
}
