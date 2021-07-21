import { Component, ChangeDetectionStrategy } from '@angular/core';
import { OfferShellComponent } from '../shell.component';
import { map } from 'rxjs/operators';

const columns = {
  titleId: { value: 'Title', disableSort: true },
  id: { value: 'Price', disableSort: true },
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
  offer$ = this.shell.offer$;
  contracts$ = this.shell.contracts$;

  constructor(private shell: OfferShellComponent) { }

  getIncome(id: string) {
    return this.shell.incomes$.pipe(
      map(incomes => incomes.find(income => income.id === id))
    );
  }
}
