import { ChangeDetectionStrategy, Component } from '@angular/core';

import { actions } from '@blockframes/waterfall/fixtures/rubber';
import { buildTable, Cell } from '@blockframes/waterfall/table';
import { waterfall } from '@blockframes/waterfall/main';

@Component({
  selector: 'waterfall-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableComponent {
  title = 'Rubber';
  currentColumn?: string;
  table: Cell[][] = [];
  groups: Record<string, Cell[][]> = {};
  columns: Record<string, Cell[][]> = {};
  trackByIndex = (i: number) => i;
  constructor() {
    const {state} = waterfall('Table', actions);
    const { table, groups, columns } = buildTable(state);
    this.table = table;
    this.groups = groups;
    this.columns = columns;
  }

  select(id: string) {
    if (id in this.groups) {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    } else if (id in this.columns) {
      this.currentColumn = id;
    }
  }
}
