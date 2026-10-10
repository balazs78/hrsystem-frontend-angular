import { Injector, runInInjectionContext } from '@angular/core';
import { of, throwError } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { MatDialog } from '@angular/material/dialog';

import { Employees } from './employees';
import { EmployeeService } from '../../../services/employee.service';
import { NotificationService } from '../../../services/notification.service';

describe('Employees', () => {
  let component: Employees;
  let employeeService: { saveEmployee: ReturnType<typeof vi.fn> };
  let notificationService: { showSuccess: ReturnType<typeof vi.fn>; showError: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    employeeService = { saveEmployee: vi.fn() };
    notificationService = { showSuccess: vi.fn(), showError: vi.fn() };

    const injector = Injector.create({
      providers: [
        { provide: MatDialog, useValue: {} },
        { provide: EmployeeService, useValue: employeeService },
        { provide: NotificationService, useValue: notificationService }
      ]
    });

    component = runInInjectionContext(injector, () => new Employees());
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should refresh the employee table after saving', () => {
    const refreshSpy = vi.fn();
    component.employeeTable = { refresh: refreshSpy } as unknown as Employees['employeeTable'];

    employeeService.saveEmployee.mockReturnValue(of({}));

    component.onSaveEmployee(new FormData());

    expect(employeeService.saveEmployee).toHaveBeenCalled();
    expect(refreshSpy).toHaveBeenCalled();
  });

  it('should show the backend error when saving fails', () => {
    employeeService.saveEmployee.mockReturnValue(
      throwError(() => ({ error: { message: 'The email has already been taken.' } }))
    );

    component.onSaveEmployee(new FormData());

    expect(notificationService.showError).toHaveBeenCalledWith('The email has already been taken.');
  });
});
