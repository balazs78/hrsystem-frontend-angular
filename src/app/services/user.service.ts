import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, switchMap } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';
import { User } from '../models/user.interface';
import { UserWriteData } from '../models/user.dto';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private readonly apiUrl = environment.apiUrl;
  private readonly webUrl = environment.webUrl;

  // Get CSRF token and make authenticated request
  private authenticatedPost<TRequest, TResponse>(endpoint: string, data: TRequest): Observable<TResponse> {
    return this.http.get(`${this.webUrl}/sanctum/csrf-cookie`, { withCredentials: true }).pipe(
      switchMap(() => {
        const token = this.getCookie('XSRF-TOKEN');
        return this.http.post<TResponse>(`${this.webUrl}${endpoint}`, data, {
          withCredentials: true,
          headers: { 'X-XSRF-TOKEN': token || '' }
        });
      })
    );
  }

  // Manual cookie extraction helper
  private getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return decodeURIComponent(parts.pop()!.split(';').shift()!);
    return null;
  }

  register(userData: UserWriteData): Observable<unknown> {
    return this.authenticatedPost<UserWriteData, unknown>('/register', userData);
  }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`).pipe(
      tap({
        next: () => {},
        error: () => {}
      })
    );
  }

  getUser(userId: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/users/${userId}`);
  }

  updateUser(userId: number, userData: UserWriteData): Observable<unknown> {
    return this.http.put<unknown>(`${this.apiUrl}/users/${userId}`, userData);
  }

  deleteUser(userId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/users/${userId}`);
  }
}