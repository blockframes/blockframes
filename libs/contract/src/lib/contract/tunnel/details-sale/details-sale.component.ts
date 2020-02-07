import { ContractForm } from '@blockframes/contract/contract/form/contract.form';
import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'contract-details-sale',
  templateUrl: './details-sale.component.html',
  styleUrls: ['./details-sale.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DetailsSaleComponent {

  constructor(private form: ContractForm) {}

  get parties(){
    return this.form.get('parties')
  }

  get versions() {
    return this.form.get('versions');
  }

  public terms(index: number){
    return this.versions.at(index).get('scope');
  }

  public price(index: number) {
    return this.versions.at(index).get('price');
  }
}
