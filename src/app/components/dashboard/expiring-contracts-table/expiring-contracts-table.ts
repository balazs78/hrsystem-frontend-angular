import { AfterViewInit, Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { ExpiringContract } from '../../../models/report-data.interface';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { ResponsiveTable } from '../../common/responsive-table/responsive-table';

@Component({
  selector: 'app-expiring-contracts-table',
  standalone: true,
  imports: [
    MatTableModule,
    MatCardModule,
    MatPaginatorModule,
    ResponsiveTable,
  ],
  templateUrl: './expiring-contracts-table.html',
  styleUrl: './expiring-contracts-table.scss',
})
export class ExpiringContractsTable implements AfterViewInit, OnChanges {
  @Input() expiringContracts: Array<ExpiringContract> = [];
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  readonly displayedColumns = ['fullName', 'contractExpireDate'];
  readonly dataSource = new MatTableDataSource<ExpiringContract>([]);
  readonly pageSize = 5;
  readonly pageSizeOptions = [5];

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['expiringContracts']) {
      this.dataSource.data = this.expiringContracts ?? [];
      if (this.paginator) {
        this.dataSource.paginator = this.paginator;
      }
    }
  }
}
