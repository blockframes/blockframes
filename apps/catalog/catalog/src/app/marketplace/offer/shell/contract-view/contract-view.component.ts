import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OfferShellComponent } from '../shell.component';
import { combineLatest } from 'rxjs';
import { map, pluck } from 'rxjs/operators';

@Component({
  selector: 'catalog-contract-view',
  templateUrl: './contract-view.component.html',
  styleUrls: ['./contract-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContractViewComponent {

  contract$ = combineLatest([
    this.shell.offer$,
    this.route.params.pipe(pluck('contractId'))
  ]).pipe(
    map(([offer, id]) => offer.contracts?.find(contract => contract.id === id))
  );

  constructor(
    private route: ActivatedRoute,
    private shell: OfferShellComponent,
  ) { }

}
