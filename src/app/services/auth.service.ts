import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { map, tap, Observable } from 'rxjs';
import { Role, User } from '../models/user.interface';
import { LoginData } from '../models/login-data.interface';
import { LoginResponse } from '../models/login-response.interface';
import { environment } from '../../environments/environment';
import { PasswordChangeData, PasswordChangeResponse, UserWriteData } from '../models/user.dto';
import { AuthTokenService } from './auth-token.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private tokenService = inject(AuthTokenService);
  private readonly apiUrl = environment.apiUrl;

  // Signals for state management
  currentUser = signal<User | null>(null);
  isLoading = signal<boolean>(false);
  isAuthenticated = signal<boolean>(false);
  isAdmin = signal<boolean>(false);
  passwordHasChanged = signal<boolean>(false);
  role = signal<Role>('Manager'); // Default role

  initialize(): Promise<void> {
    if (!this.tokenService.getToken()) {
      this.clearAuthState();
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      this.http.get<User>(`${this.apiUrl}/user`).subscribe({
        next: (user: User) => {
          this.setAuthenticatedUser(user);
          resolve();
        },
        error: () => {
          this.tokenService.clearToken();
          this.clearAuthState();
          resolve();
        }
      });
    });
  }

  login(credentials: LoginData): Observable<User> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        this.tokenService.setToken(response.token, credentials.remember);
        this.setAuthenticatedUser(response.user);
      }),
      map(response => response.user)
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
    return this.http.post<unknown>(`${this.apiUrl}/register`, userData);
  }


  forgotPassword(email: string): Observable<unknown> {
    return this.http.post<unknown>(`${this.apiUrl}/forgot-password`, { email }, { });
  }

  changePassword(passwordData: PasswordChangeData): Observable<PasswordChangeResponse> {
    return this.http.post<PasswordChangeResponse>(`${this.apiUrl}/force-password-update`, passwordData);
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
    return this.http.post<unknown>(`${this.apiUrl}/logout`, {}).pipe(
      tap({
        next: () => this.finishLogout(),
        error: () => this.finishLogout()
      })
    );
  }

  private setAuthenticatedUser(user: User): void {
    this.currentUser.set(user);
    this.isAuthenticated.set(true);
    this.role.set(user.role);
    this.isAdmin.set(user.role === 'Admin');
    this.passwordHasChanged.set(user.password_changed_at !== null);
  }

  private clearAuthState(): void {
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    this.isAdmin.set(false);
    this.passwordHasChanged.set(false);
    this.role.set('Manager');
  }

  private finishLogout(): void {
    this.tokenService.clearToken();
    this.clearAuthState();
    this.router.navigate(['/login']);
  }

}