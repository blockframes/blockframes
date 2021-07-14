import { Component, ChangeDetectionStrategy } from '@angular/core';
import { OfferShellComponent } from '../shell.component';
import { map } from 'rxjs/operators';

const columns = {
  'titleId': 'Title',
  'price': 'Price'
}

@Component({
  selector: 'catalog-contract-list',
  templateUrl: './contract-list.component.html',
  styleUrls: ['./contract-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContractListComponent  {
  columns = columns;
  initialColumns = Object.keys(columns);
  contracts$ = this.shell.fullContracts$.pipe(
    map(record => Object.values(record))
  );

  constructor(private shell: OfferShellComponent) { }

}
