import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuditLogApiResponse } from '../models/audit-log-api-response.interface';
import { environment } from '../../environments/environment';

export interface AuditLogParams {
  userId?: number | null;
  employeeId?: number | null;
  startDate?: string | null;
  endDate?: string | null;
  period?: 'today' | 'yesterday' | 'last_7_days' | 'last_30_days' | 'custom' | null;
  sort?: 'asc' | 'desc' | null;
  page?: number | null;
  pageSize?: number | null;
}

@Injectable({ providedIn: 'root' })
export class AuditLogService {
  private readonly apiUrl = environment.apiUrl;
  constructor(private http: HttpClient) {}

  getAuditLogs(params: AuditLogParams = {}): Observable<AuditLogApiResponse> {
    let httpParams = new HttpParams();
    if (params?.userId !== null && params?.userId !== undefined) httpParams = httpParams.set('userId', String(params.userId));
    if (params?.employeeId !== null && params?.employeeId !== undefined) httpParams = httpParams.set('employeeId', String(params.employeeId));
    if (params?.startDate) httpParams = httpParams.set('startDate', params.startDate);
    if (params?.endDate) httpParams = httpParams.set('endDate', params.endDate);
    if (params?.period) httpParams = httpParams.set('period', params.period);
    if (params?.sort) httpParams = httpParams.set('sort', params.sort);
    if (params?.page !== null && params?.page !== undefined) httpParams = httpParams.set('page', String(params.page));
    if (params?.pageSize !== null && params?.pageSize !== undefined) httpParams = httpParams.set('pageSize', String(params.pageSize));

    return this.http.get<AuditLogApiResponse>(`${this.apiUrl}/audit-logs`, { params: httpParams });
  }
}
