import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

/** Flattened data of version to pass in bf-table-filer. */
interface VersionView {
  date: string;
  price: string;
  status: string;
}

const columns = {
  date: 'Date',
  price: 'Offer Amount',
  status: 'Status'
} as const;

type ColumnsKeys = keyof typeof columns;

const baseColumns: ColumnsKeys[] = ['date', 'price', 'status'];

@Component({
  selector: '[versions] contract-version-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VersionTableComponent {
  columns = columns;
  initialColumns = baseColumns;

  @Input() versions: VersionView[];
}
