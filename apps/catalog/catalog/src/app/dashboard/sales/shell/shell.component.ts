import { Component, ChangeDetectionStrategy, Optional } from '@angular/core';
import { ContractService } from '@blockframes/contract/contract/service';
import { ActivatedRoute } from '@angular/router';
import { pluck, shareReplay, switchMap } from 'rxjs/operators';
import { centralOrgId } from '@env';
import { joinWith } from 'ngfire';
import { MovieService } from '@blockframes/movie/service';
import { Intercom } from 'ng-intercom';
import { Sale, contractStatus } from '@blockframes/model';

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
      title: (sale: Sale) => this.titleService.getValue(sale.titleId),
      negotiation: (sale: Sale) => this.contractService.lastNegotiation(sale.id),
    }),
    shareReplay({ bufferSize:1, refCount:true })
  );
  centralOrgId = centralOrgId;
  contractStatus = contractStatus;


  constructor(
    private contractService: ContractService,
    private titleService: MovieService,
    private route: ActivatedRoute,
    @Optional() private intercom: Intercom,
  ) { }

  openIntercom(): void {
    return this.intercom.show();
  }
}
