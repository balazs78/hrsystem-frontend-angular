import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Position } from '../models/position.interface';
import { Observable } from 'rxjs/internal/Observable';
import { PositionApiResponse } from '../models/position-api-response.interface';
import { map } from 'rxjs/internal/operators/map';
import { environment } from '../../environments/environment';
import { shareReplay } from 'rxjs/internal/operators/shareReplay';

@Injectable({
  providedIn: 'root',
})
export class PositionService {
  private readonly apiUrl = environment.apiUrl;
  private positionsCache$?: Observable<PositionApiResponse>;

  constructor(private http: HttpClient) { }

  getPositions(): Observable<PositionApiResponse> {
    if (!this.positionsCache$) {
      this.positionsCache$ = this.http.get<PositionApiResponse>(`${this.apiUrl}/positions`)
      .pipe(shareReplay(1));
    }
    return this.positionsCache$;
  }

  private invalidatePositionsCache(): void {
    this.positionsCache$ = undefined;
  }
  
  savePosition(position: Position, positionID?: number): Observable<Position> {
    if(positionID == undefined) {
      return this.createPosition(position);
    }
    return this.updatePosition(positionID, position);
  }

  createPosition(position: Position): Observable<Position> {  
    return this.http.post<Position>(`${this.apiUrl}/positions`, position).pipe(
      map(() => {
        this.invalidatePositionsCache();
        return position;
      })
    );
  }

  updatePosition(positionID: number, position: Position): Observable<Position> {
    return this.http.put<Position>(`${this.apiUrl}/positions/${positionID}`, {
      title: position.title,
      salaryGrade: position.salaryGrade,
      description: position.description
    }).pipe(
      map(() => {
        this.invalidatePositionsCache();
        return position;
      })
    );
  }

  deletePosition(positionID: number): Observable<void> {
      return this.http.delete<void>(`${this.apiUrl}/positions/${positionID}`).pipe(
        map(() => {
          this.invalidatePositionsCache();
        })
      );
    }
}