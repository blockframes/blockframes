import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ContractForm } from '@blockframes/contract/forms/contract.form';


@Component({
  selector: 'catalog-chain-of-titles',
  templateUrl: './chain-of-titles.component.html',
  styleUrls: ['./chain-of-titles.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChainOfTitlesComponent {

  constructor(private form: ContractForm) { }

  // get chainOfTitle() {
  //   return this.form.get('')
  // }

}
