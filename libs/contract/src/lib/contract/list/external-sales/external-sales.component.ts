import { Component, ChangeDetectionStrategy, Input, } from '@angular/core';
import { appName } from '@blockframes/utils/apps';
import { Contract, Sale } from '@blockframes/contract/contract/+state';
import { OrganizationService } from '@blockframes/organization/+state';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { AppGuard } from '@blockframes/utils/routes/app.guard';

interface ExternalSale extends Sale<Date> {
  licensor: string;
  licensee: string;
  title: string;
}

@Component({
  selector: 'external-sales-list',
  templateUrl: './external-sales.component.html',
  styleUrls: ['./external-sales.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExternalSaleListComponent {
  public app = this.appGuard.currentApp;
  public appName = appName[this.app];
  public orgId = this.orgService.org.id;

  @Input() private title = 'My Sale';

  private _sales = new BehaviorSubject<ExternalSale[]>([]);

  constructor(
    private orgService: OrganizationService,
    private router: Router,
    private route: ActivatedRoute,
    private appGuard: AppGuard,
  ) { }

  @Input() set sales(sale: ExternalSale[]) {
    this._sales.next(sale);
  }

  get sales() {
    return this._sales.value;
  }


  goToSale({ id }: Contract) {
    this.router.navigate([id], { relativeTo: this.route });
  }
}
