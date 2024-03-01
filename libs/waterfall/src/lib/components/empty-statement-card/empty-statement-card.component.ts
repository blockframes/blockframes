// Angular
import { Component, ChangeDetectionStrategy, Input, HostListener, Output, EventEmitter, OnInit } from '@angular/core';
import { Observable, combineLatest, map, tap } from 'rxjs';

// Blockframes
import { boolean } from '@blockframes/utils/decorators/decorators';
import { DashboardWaterfallShellComponent } from '@blockframes/waterfall/dashboard/shell/shell.component';
import { StatementType, statementsRolesMapping } from '@blockframes/model';

@Component({
  selector: 'waterfall-empty-statement-card',
  templateUrl: './empty-statement-card.component.html',
  styleUrls: ['./empty-statement-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyStatementCardComponent implements OnInit {

  @Input() type: StatementType;
  @Input() @boolean disabled: boolean;
  @Output() selected = new EventEmitter<boolean>();

  public isDisabled$: Observable<boolean>;
  private _disabled = true;

  @HostListener('click') onClick() {
    if (this.disabled) return;
    if (!this._disabled) this.selected.emit(true);
  }

  constructor(
    private shell: DashboardWaterfallShellComponent
  ) { }

  ngOnInit() {
    this.isDisabled$ = combineLatest([this.shell.currentRightholder$, this.shell.canBypassRules$]).pipe(
      map(([rightholder, canBypassRules]) => {
        if (!this.type) return true;
        if (canBypassRules) return false;
        // Only the producer can create direct sales and producer statements, and producer is always an admin
        if (['directSales', 'producer'].includes(this.type)) return true;
        return !rightholder.roles.some(role => statementsRolesMapping[this.type].includes(role));
      }),
      tap(disabled => this._disabled = disabled)
    );
  }
}
