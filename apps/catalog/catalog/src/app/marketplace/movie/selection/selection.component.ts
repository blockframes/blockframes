import { Component, ChangeDetectionStrategy, HostBinding, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MarketplaceQuery, MarketplaceStore } from '../../+state';
import { MovieQuery } from '@blockframes/movie';
import { ContractService, Contract, ContractTitleDetail } from '@blockframes/contract/contract/+state';
import { ContractVersion } from '@blockframes/contract/version/+state';
import { CommissionBase } from '@blockframes/utils/common-interfaces';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'catalog-selection',
  templateUrl: './selection.component.html',
  styleUrls: ['./selection.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarketplaceSelectionComponent implements OnInit {
  @HostBinding('attr.page-id') pageId = 'catalog-selection';

  count$ = this.query.selectCount();
  titles$ = this.query.selectAll();
  isInWishist$: Observable<Record<string, Observable<boolean>>>;

  constructor(
    public store: MarketplaceStore,
    private query: MarketplaceQuery,
    private service: ContractService,
    private movieQuery: MovieQuery,
    private router: Router,
  ) {}

  ngOnInit() {

  }

  /** Select a movie for a specific movie Id */
  selectMovie(movieId: string) {
    return this.movieQuery.selectEntity(movieId);
  }

  inWishlist(movieId: string) {

    return this.query.isInWishlist(movieId);
  }

  /** Create a Contract, remove the current selection, move to tunnel */
  async create() {
    const titleIds = this.query.getValue().ids;
    const contract: Partial<Contract> = { titleIds };
    const version: Partial<ContractVersion> = {};
    for (const movieId of titleIds) {
      (version.titles[movieId] as Partial<ContractTitleDetail>) = {
        price: { commissionBase: CommissionBase.grossreceipts, amount: 0, currency: 'USD' }
      };
    }
    const contractId = await this.service.create(contract, version);
    this.router.navigate(['c/o/marketplace/contract', contractId, 'mandate']);
  }

}
