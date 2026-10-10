import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap, switchMap, Observable } from 'rxjs';
import { Role, User } from '../models/user.interface';
import { LoginData } from '../models/login-data.interface';
import { UserService } from './user.service';
import { environment } from '../../environments/environment';
import { PasswordChangeData, PasswordChangeResponse, UserWriteData } from '../models/user.dto';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private readonly apiUrl = environment.apiUrl;
  private readonly webUrl = environment.webUrl;

  // Signals for state management
  currentUser = signal<User | null>(null);
  isLoading = signal<boolean>(false);
  isAuthenticated = signal<boolean>(false);
  isAdmin = signal<boolean>(false);
  passwordHasChanged = signal<boolean>(false);
  role = signal<Role>('Manager'); // Default role

  initialize(): Promise<void> {
    return new Promise((resolve) => {
      this.http.get<User>(`${this.apiUrl}/user`, { withCredentials: true }).subscribe({
        next: (user: User) => {
          this.currentUser.set(user);
          this.isAuthenticated.set(true);
          this.role.set((user as User).role);
          this.isAdmin.set((user as User).role === 'Admin');
          this.passwordHasChanged.set((user as User).password_changed_at !== null);
          resolve();
        },
        error: () => {
          this.currentUser.set(null);
          this.isAuthenticated.set(false);
          this.isAdmin.set(false);
          this.role.set('Manager');
          this.passwordHasChanged.set(false);
          resolve(); // Resolve anyway so the app can boot to Login
        }
      });
    });
  }

 login(credentials: LoginData) {
  return this.http.get(`${this.webUrl}/sanctum/csrf-cookie`, { withCredentials: true }).pipe(
    switchMap(() => {
      const token = this.getCookie('XSRF-TOKEN');
      return this.http.post<User>(`${this.webUrl}/login`, credentials, {
        withCredentials: true,
        headers: { 'X-XSRF-TOKEN': token || '' }
      });
    }),
    switchMap(() => {
      return this.http.get<User>(`${this.apiUrl}/user`, { withCredentials: true });
    }),
    tap((user: User) => {
      this.currentUser.set(user);
      this.isAuthenticated.set(true);
      this.role.set(user.role);
      this.isAdmin.set(user.role === 'Admin');
      this.passwordHasChanged.set(user.password_changed_at !== null);
    })
  );
}

  checkAuthStatus(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/user`).pipe(
      tap({
        next: () => this.isAuthenticated.update(() => true),
        error: () => this.isAuthenticated.update(() => false)
      })
    );
  }

  register(userData: UserWriteData): Observable<unknown> {
    return this.http.get(`${this.webUrl}/sanctum/csrf-cookie`, { withCredentials: true }).pipe(
      switchMap(() => {
        const token = this.getCookie('XSRF-TOKEN');
        return this.http.post<unknown>(`${this.webUrl}/register`, userData, {
          withCredentials: true,
          headers: { 'X-XSRF-TOKEN': token || '' }
        });
      }),      
    );
  }


  forgotPassword(email: string): Observable<unknown> {
    return this.http.post<unknown>(`${this.webUrl}/forgot-password`, { email }, { });
  }

  changePassword(passwordData: PasswordChangeData): Observable<PasswordChangeResponse> {
    return this.http.get(`${this.webUrl}/sanctum/csrf-cookie`, { withCredentials: true }).pipe(
      switchMap(() => {
        const token = this.getCookie('XSRF-TOKEN');
        return this.http.post<PasswordChangeResponse>(`${this.webUrl}/force-password-update`, passwordData, {
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

  // User CRUD operations
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`).pipe(
      tap({
        next: () => this.isAuthenticated.update(() => true),
        error: () => this.isAuthenticated.update(() => false)
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


  logout(): Observable<unknown> {
    return this.http.get(`${this.webUrl}/sanctum/csrf-cookie`, { withCredentials: true }).pipe(
      switchMap(() => {
        const token = this.getCookie('XSRF-TOKEN');
        return this.http.post<unknown>(`${this.webUrl}/logout`, {}, {
          withCredentials: true,
          headers: { 'X-XSRF-TOKEN': token || '' }
        }).pipe(
      tap({
        next: () => {
          this.currentUser.set(null);
          this.isAuthenticated.set(false);
          this.isAdmin.set(false);
          this.passwordHasChanged.set(false);
          this.router.navigate(['/login']);
        },
        error: () => {
          // Even on error, clear local state and redirect
          this.currentUser.set(null);
          this.isAuthenticated.set(false);
          this.isAdmin.set(false);
          this.passwordHasChanged.set(false);
          this.router.navigate(['/login']);
        }
      })
    );
      })
    );
  }

}