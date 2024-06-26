import { Component, ChangeDetectionStrategy, Input, EventEmitter, Output } from '@angular/core';
import { Waterfall, WaterfallRightholder } from '@blockframes/model';

@Component({
  selector: '[waterfall]waterfall-rightholder-table',
  templateUrl: './rightholder-table.component.html',
  styleUrls: ['./rightholder-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RightholderTableComponent {
  @Input() waterfall: Waterfall;
  @Input() columns: Record<string, string> = {
    name: $localize`Organization Name`,
    roles: $localize`Waterfall Roles`,
  };
  @Input() actions: Record<string, boolean> = {
    crm: true,
    delete: true,
  };
  @Output() delete = new EventEmitter<WaterfallRightholder>();
  @Output() rowClick = new EventEmitter<string>();
}

