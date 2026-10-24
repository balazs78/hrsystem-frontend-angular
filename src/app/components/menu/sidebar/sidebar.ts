import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MenuItem } from '../../../models/menu-item.interface';
import { AuthService } from '../../../services/auth.service';
import { Toolbar } from '../toolbar/toolbar';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    RouterModule, 
    MatListModule, 
    MatIconModule, 
    MatSidenavModule,
    Toolbar
  ],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  authService = inject(AuthService);
  menuItems: MenuItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
    { label: 'Employees', icon: 'people', route: '/employees' },
    { label: 'Positions', icon: 'person', route: '/positions' },
    { label: 'Departments', icon: 'domain', route: '/departments' },
    { 
      label: 'Reports', 
      icon: 'assessment', 
      route: '/reports',
      children: [
        { label: 'Department headcounts', icon: 'bar_chart', route: '/reports/department-headcounts' },
        { label: 'Yearly trend', icon: 'trending_up', route: '/reports/yearly-trend' }
      ]
    },
    { label: 'Users', icon: 'person_add', route: '/users', roles: ['Admin', 'Auditor'] },
    // This item is only for Admins and Auditors, so it won't show for Managers
    { label: 'Audit Logs', icon: 'security', route: '/audit-logs', roles: ['Admin', 'Auditor'] }
  ];
  bdclick(sidenav: MatSidenav) {
    sidenav.close();
  }

}
