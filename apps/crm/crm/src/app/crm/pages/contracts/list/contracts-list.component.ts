import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { appName, getCurrentApp } from '@blockframes/utils/apps';
import { OrganizationService } from '@blockframes/organization/+state';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { ContractsShellComponent } from '../shell/contracts-shell.component';

@Component({
  selector: 'crm-contracts-list',
  templateUrl: './contracts-list.component.html',
  styleUrls: ['./contracts-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContractsListComponent {
  public app = getCurrentApp(this.routerQuery);
  public appName = appName[this.app];
  public orgId = this.orgService.org.id;

  public externalSales$ = this.shell.externalSales$;

  constructor(
    private routerQuery: RouterQuery,
    private orgService: OrganizationService,
    private shell: ContractsShellComponent,
    private dynTitle: DynamicTitleService,
  ) { }

  ngOnInit() {
    this.dynTitle.setPageTitle('My Sales (All)');
  }
}
