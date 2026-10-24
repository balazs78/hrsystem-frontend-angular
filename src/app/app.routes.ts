import { Routes } from '@angular/router';
import { AuthChildGuard, AuthGuard, GuestGuard } from './guards/auth.guard';

export const routes: Routes = [
    {
        path: "login",
        loadComponent: () => import('./components/login/login').then(m => m.LoginComponent),
        canActivate: [GuestGuard]
    }, 
    { 
        path: 'password-reset/:token', 
        loadComponent: () => import('./components/auth/reset-password-component/reset-password-component')
            .then(m => m.ResetPasswordComponent)
    },     
    {
        path: '',
        canActivate: [AuthGuard],
        canActivateChild: [AuthChildGuard],
        children: [
            {
                path: '',
                redirectTo: 'dashboard',
                pathMatch: 'full'
            },
            {
                path: "dashboard",
                loadComponent: () => import('./components/dashboard/dashboard').then(m => m.Dashboard)
            }, 
            {
                path: "employees",
                loadComponent: () => import('./components/employees/employees/employees').then(m => m.Employees)
            }, 
            {
                path: "departments",
                loadComponent: () => import('./components/departments/departments').then(m => m.Departments)
            }, 
            {
                path: "positions",
                loadComponent: () => import('./components/positions/positions').then(m => m.Positions)
            }, 
            {
                path: "reports/department-headcounts",
                loadComponent: () => import('./components/reports/department-headcounts-report/department-headcounts-report')
                    .then(m => m.DepartmentHeadcountsReport)
            }, 
            {
                path: "reports/yearly-trend",
                loadComponent: () => import('./components/reports/yearly-trend-report/yearly-trend-report')
                    .then(m => m.YearlyTrendReport)
            },
            {
                path: "users",
                loadComponent: () => import('./components/users/users').then(m => m.Users)
            },
            {
                path: "audit-logs",
                loadComponent: () => import('./components/audit-logs/audit-log/audit-log')
                    .then(m => m.AuditLogComponent)
            },
            {
                path: 'force-password-update',
                loadComponent: () => import('./components/login/force-password-update-component/force-password-update-component')
                    .then(m => m.ForcePasswordUpdateComponent)
            },
            {
                path: 'profile-settings',
                loadComponent: () => import('./components/profile/profile-settings-component/profile-settings-component')
                    .then(m => m.ProfileSettingsComponent)
            },
        ]
    },
    
];
