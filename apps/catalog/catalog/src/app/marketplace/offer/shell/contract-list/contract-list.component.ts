import { Component, ChangeDetectionStrategy } from '@angular/core';
import { OfferShellComponent } from '../shell.component';

const columns = {
  'title.title.international': 'Title',
  'title.release.year': 'Release Year',
  'title.directors': 'Directors',
  'income.price': 'Price',
}

@Component({
  selector: 'catalog-contract-list',
  templateUrl: './contract-list.component.html',
  styleUrls: ['./contract-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContractListComponent  {
  columns = columns;
  offer$ = this.shell.offer$;

  constructor(
    private shell: OfferShellComponent,
  ) { }


}
