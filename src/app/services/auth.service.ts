import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, BehaviorSubject, of } from 'rxjs';
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
    // In non-production builds allow convenient dev shortcuts; otherwise always call backend
    // COMMENTED OUT to prevent invalid token issues with real backend
    /*
    if (!environment.production) {
      // Development shortcut: if logging in with admin/admin123 locally, bypass backend
      if (request.username === 'admin' && request.password === 'admin123') {
        const devResp: AuthResponse = { token: 'dev-admin-token', role: 'ADMIN' };
        return of(devResp).pipe(
          tap(response => {
            if (response && response.token) {
              this.setToken(response.token);
              if (response.role) this.setRole(response.role);

              // Save username locally
              if (request.username) {
                localStorage.setItem('username', request.username);
              }

              this.isAuthenticatedSubject.next(true);
            }
          })
        );
      }

      // Development shortcut: for any other username/password, treat as regular USER locally
      if (request.username && request.password) {
        const devResp: AuthResponse = { token: 'dev-user-token', role: 'USER' };
        return of(devResp).pipe(
          tap(response => {
            if (response && response.token) {
              this.setToken(response.token);
              if (response.role) this.setRole(response.role);

              if (request.username) {
                localStorage.setItem('username', request.username);
              }

              this.isAuthenticatedSubject.next(true);
            }
          })
        );
      }
    }
    */

    // Default: call backend login
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, request).pipe(
      tap(response => {
        if (response && response.token) {
          this.setToken(response.token);
          if (response.role) this.setRole(response.role);

          // Save username from the login request
          if (request.username) {
            localStorage.setItem('username', request.username);
          } else if (request.email) {
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
            if (payload.userId) {
              localStorage.setItem('userId', payload.userId.toString());
            } else if (payload.id) {
              localStorage.setItem('userId', payload.id.toString());
            }
            
            // Extract role from JWT
            let extractedRole = null;
            if (payload.role) {
              extractedRole = payload.role;
            } else if (payload.roles) {
              extractedRole = Array.isArray(payload.roles) ? payload.roles[0] : payload.roles;
            } else if (payload.authorities) {
              const auth = Array.isArray(payload.authorities) ? payload.authorities[0] : payload.authorities;
              extractedRole = auth.authority || auth;
            }
            
            if (extractedRole) {
              const upperRole = typeof extractedRole === 'string' ? extractedRole.toUpperCase() : '';
              if (upperRole.includes('ADMIN')) {
                this.setRole('ADMIN');
              } else {
                this.setRole('USER');
              }
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
    this.isAuthenticatedSubject.next(false);
  }

  private setToken(token: string): void {
    localStorage.setItem('token', token);
  }

  private setRole(role: string): void {
    localStorage.setItem('role', role);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getRole(): string | null {
    return localStorage.getItem('role');
  }

  getUsername(): string | null {
    return localStorage.getItem('username');
  }

  private hasToken(): boolean {
    return !!this.getToken();
  }
}
