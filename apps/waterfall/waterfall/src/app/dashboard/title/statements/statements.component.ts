// Angular
import { Component, ChangeDetectionStrategy, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import {
  Right,
  RightholderRole,
  Statement,
  StatementType,
  StatementTypeValue,
  WaterfallRightholder,
  isProducerStatement,
  rightholderGroups,
  sortByDate,
  statementType
} from '@blockframes/model';

// Blockframes
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { DashboardWaterfallShellComponent } from '@blockframes/waterfall/dashboard/shell/shell.component';
import { Subscription, firstValueFrom, startWith } from 'rxjs';

interface StatementRolesConfig {
  roles: RightholderRole[],
  divider: boolean,
  visible: boolean,
};

interface StatementChipConfig {
  roles: RightholderRole[];
  divider: boolean;
  selected: boolean;
  key: StatementType;
  value: StatementTypeValue;
}

const statementsRolesMapping: Record<StatementType, StatementRolesConfig> = {
  mainDistributor: { roles: ['mainDistributor'], divider: false, visible: true },
  salesAgent: { roles: ['salesAgent'], divider: false, visible: true },
  directSales: { roles: ['producer'], divider: true, visible: true },
  producer: { roles: Object.keys(rightholderGroups.beneficiaries) as RightholderRole[], divider: true, visible: true },
}

@Component({
  selector: 'waterfall-title-statements',
  templateUrl: './statements.component.html',
  styleUrls: ['./statements.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatementsComponent implements OnInit, OnDestroy {
  public waterfall$ = this.shell.waterfall$;

  public statements: Statement[] = [];
  public rightholderStatements: (Statement & { order: number })[] = [];

  public rightholders: WaterfallRightholder[] = [];
  public rightholderControl = new FormControl<string>('');


  private rights: Right[];
  public statementTypes: StatementChipConfig[] = [];
  public selected: StatementType;
  private waterfall = this.shell.waterfall;
  private sub: Subscription;

  constructor(
    private shell: DashboardWaterfallShellComponent,
    private dynTitle: DynamicTitleService,
    private cdr: ChangeDetectorRef
  ) {
    this.shell.setDate(undefined);
    this.dynTitle.setPageTitle(this.shell.movie.title.international, 'Statements');
  }

  async ngOnInit() {
    this.rights = await firstValueFrom(this.shell.rights$);
    this.statements = await firstValueFrom(this.shell.statements$);
    this.statementTypes = Object.entries(statementsRolesMapping).map(([key, value]: [StatementType, StatementRolesConfig]) => (
      {
        selected: false,
        key,
        value: statementType[key],
        ...value,
        visible: key === 'producer' ? this.statements.some(s => !isProducerStatement(s) && s.status === 'reported') : value.visible
      }
    ));

    this.changeType('mainDistributor');

    this.sub = this.rightholderControl.valueChanges.pipe(startWith(this.rightholderControl.value)).subscribe(value => {
      const filteredStatements = this.statements.filter(statement => statement[this.selected === 'producer' ? 'receiverId' : 'senderId'] === value && statement.type === this.selected);
      this.rightholderStatements = sortByDate(filteredStatements, 'duration.to').map((s, i) => ({ ...s, order: i + 1 })).reverse();
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  public changeType(key: StatementType) {
    this.statementTypes = this.statementTypes.map(type => type.key === key ? { ...type, selected: !type.selected } : { ...type, selected: false });
    const selected = this.statementTypes.find(type => type.selected);
    this.selected = selected.key;
    if (!selected) this.rightholders = [];
    const rightholders = this.waterfall.rightholders
      .filter(r => r.roles.some(role => selected.roles.includes(role)))
      .filter(r => this.statements.some(statement => statement[this.selected === 'producer' ? 'receiverId' : 'senderId'] === r.id && statement.type === selected.key));

    // TODO #9485 CF statementsToCreate on CRM SIDE (use rights that are in relation with distributor statements)

    // TODO #9485 display only rightholders that have statements
    this.rightholders = rightholders;
    this.rightholderControl.setValue(this.rightholders[0]?.id);
    // TODO #9485 + que ceux avec qui j'ai un contrat ?

    this.cdr.markForCheck();
  }
}
