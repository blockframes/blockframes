import {
  Component, ChangeDetectionStrategy, Optional
} from '@angular/core';
import { ContractService, contractStatus, Sale } from '@blockframes/contract/contract/+state';
import { ActivatedRoute } from '@angular/router';
import { pluck, shareReplay, switchMap } from 'rxjs/operators';
import { centralOrgId } from '@env';
import { joinWith } from '@blockframes/utils/operators';
import { MovieService } from '@blockframes/movie/+state';
import { IncomeService } from '@blockframes/contract/income/+state';
import { Intercom } from 'ng-intercom';


@Component({
  selector: 'sale-shell',
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SaleShellComponent {

  sale$ = this.route.params.pipe(
    pluck('saleId'),
    switchMap((id: string) => this.contractService.valueChanges(id)),
    joinWith({
      income: (sale: Sale) => this.incomeService.valueChanges(sale.id),
      movie: (sale: Sale) => this.titleService.getValue(sale.titleId),
      negotiation: (sale: Sale) => ['pending', 'negotiating'].includes(sale.status) ? this.contractService.lastNegotiation(sale.id) : null,
    }),
    shareReplay({bufferSize:1, refCount:true})
  );
  centralOrgId = centralOrgId;
  contractStatus = contractStatus;


  constructor(
    private contractService: ContractService,
    private titleService: MovieService,
    private route: ActivatedRoute,
    private incomeService: IncomeService,
    @Optional() private intercom: Intercom,
  ) { }

  openIntercom(): void {
    return this.intercom.show();
  }
}
