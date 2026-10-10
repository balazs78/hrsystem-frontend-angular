import { AfterViewInit, Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { OnboardingEmployee } from '../../../models/report-data.interface';
import { ResponsiveTable } from '../../common/responsive-table/responsive-table';

@Component({
  selector: 'app-onboarding-employees-table',
  standalone: true,
  imports: [
    MatTableModule,
    MatCardModule,
    MatPaginatorModule,
    ResponsiveTable,
  ],
  templateUrl: './onboarding-employees-table.html',
  styleUrl: './onboarding-employees-table.scss',
})
export class OnboardingEmployeesTable implements AfterViewInit, OnChanges {
  @Input() onboardingEmployees: Array<OnboardingEmployee> = [];
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  readonly displayedColumns = ['fullName'];
  readonly dataSource = new MatTableDataSource<OnboardingEmployee>([]);
  readonly pageSize = 5;
  readonly pageSizeOptions = [5];

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['onboardingEmployees']) {
      this.dataSource.data = this.onboardingEmployees ?? [];
      if (this.paginator) {
        this.dataSource.paginator = this.paginator;
      }
    }
  }
}
