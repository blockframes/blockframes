import { Component, ChangeDetectionStrategy } from '@angular/core';
import { OfferShellComponent } from '../shell.component';

@Component({
  selector: 'catalog-contract-list',
  templateUrl: './contract-list.component.html',
  styleUrls: ['./contract-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContractListComponent {
  offer$ = this.shell.offer$;

  constructor(private shell: OfferShellComponent) { }


}
