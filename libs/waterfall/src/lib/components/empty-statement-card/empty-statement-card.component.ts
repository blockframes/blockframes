// Angular
import { Component, ChangeDetectionStrategy, Input, HostListener, Output, EventEmitter, OnInit } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, map, tap } from 'rxjs';

// Blockframes
import { boolean } from '@blockframes/utils/decorators/decorators';
import { DashboardWaterfallShellComponent } from '../../dashboard/shell/shell.component';
import { StatementType, canCreateStatement } from '@blockframes/model';

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
    this.isDisabled$ = combineLatest([this.type$, this.shell.contracts$]).pipe(
      map(([type, contracts]) => !canCreateStatement(type, this.shell.currentRightholder, producer, contracts, this.shell.canBypassRules)),
      tap(disabled => this._disabled = disabled)
    );
  }
}
