import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { User } from '../models/user.interface';
import { UserWriteData } from '../models/user.dto';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;
  private readonly webUrl = environment.webUrl;

  register(userData: UserWriteData): Observable<unknown> {
    return this.http.post<unknown>(`${this.apiUrl}/register`, userData);
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