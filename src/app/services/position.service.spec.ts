import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { PositionService } from './position.service';
import { environment } from '../../environments/environment';
import { Position } from '../models/position.interface';
import { PositionApiResponse } from '../models/position-api-response.interface';

describe('PositionService', () => {
  let service: PositionService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClientTesting()]
    });
    service = TestBed.inject(PositionService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch positions', () => {
    const mockResponse: PositionApiResponse = { data: [] };

    service.getPositions().subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/positions`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should invalidate cached positions after creating a new one', () => {
    const firstResponse = { data: [{ id: 1, title: 'Old', salaryGrade: 'A', headcount: 1, description: '', createdAt: '' }] };
    const secondResponse = { data: [{ id: 1, title: 'Old', salaryGrade: 'A', headcount: 1, description: '', createdAt: '' }, { id: 2, title: 'New', salaryGrade: 'B', headcount: 0, description: '', createdAt: '' }] };

    service.getPositions().subscribe();
    httpMock.expectOne(`${environment.apiUrl}/positions`).flush(firstResponse);

    const newPosition: Position = { id: 2, title: 'New', salaryGrade: 'B', headcount: 0, description: '', createdAt: '' };
    service.createPosition(newPosition).subscribe();
    httpMock.expectOne(`${environment.apiUrl}/positions`).flush({ id: 2, title: 'New', salaryGrade: 'B', headcount: 0, description: '', createdAt: '' });

    service.getPositions().subscribe(response => {
      expect(response).toEqual(secondResponse);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/positions`);
    expect(req.request.method).toBe('GET');
    req.flush(secondResponse);
  });
});