// Angular
import { Component, ChangeDetectionStrategy, Input, HostListener, Output, EventEmitter, OnInit } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, map, tap } from 'rxjs';

// Blockframes
import { boolean } from '@blockframes/utils/decorators/decorators';
import { DashboardWaterfallShellComponent } from '@blockframes/waterfall/dashboard/shell/shell.component';
import { StatementType, getContractsWith, statementsRolesMapping } from '@blockframes/model';

@Component({
  selector: 'waterfall-empty-statement-card',
  templateUrl: './empty-statement-card.component.html',
  styleUrls: ['./empty-statement-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyStatementCardComponent implements OnInit {

  @Input() set type(type: StatementType) {
    this.type$.next(type);
  };
  @Input() @boolean disabled: boolean;
  @Output() selected = new EventEmitter<boolean>();

  public isDisabled$: Observable<boolean>;
  public type$ = new BehaviorSubject<StatementType>(null);
  private _disabled = true;

  @HostListener('click') onClick() {
    if (this.disabled) return;
    if (!this._disabled) this.selected.emit(true);
  }

  constructor(
    private shell: DashboardWaterfallShellComponent
  ) { }

  ngOnInit() {
    const producer = this.shell.waterfall.rightholders.find(r => r.roles.includes('producer'));
    this.isDisabled$ = combineLatest([this.type$, this.shell.currentRightholder$, this.shell.canBypassRules$, this.shell.contracts$]).pipe(
      map(([type, rightholder, canBypassRules, contracts]) => {
        if (!type) return true;
        if (canBypassRules) return false;
        // Only the producer can create direct sales and producer statements, and producer is always an admin
        if (['directSales', 'producer'].includes(type)) return true;
        if (!rightholder.roles.some(role => statementsRolesMapping[type].includes(role))) return true;
        return getContractsWith([producer.id, rightholder.id], contracts).filter(c => statementsRolesMapping[type].includes(c.type)).length === 0;
      }),
      tap(disabled => this._disabled = disabled)
    );
  }
}
