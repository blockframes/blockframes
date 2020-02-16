import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ContractQuery, getTotalPrice } from '@blockframes/contract/contract/+state';
import { map, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'marketplace-deal-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewComponent {

  public contract$ = this.query.selectActive();
  public version$ = this.query.activeVersion$;

  count$ = this.query.activeVersion$.pipe(
    map(version => Object.keys(version.titles)),
    distinctUntilChanged()
  );
  totalPrice$ = this.query.activeVersion$.pipe(
    map(version => getTotalPrice(version.titles)),
    distinctUntilChanged()
  );

  constructor(private query: ContractQuery) { }

}
