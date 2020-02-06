import { ContractForm } from '@blockframes/contract/contract/form/contract.form';
import { Component } from '@angular/core';

@Component({
  selector: 'contract-details-sale',
  templateUrl: './details-sale.component.html',
  styleUrls: ['./details-sale.component.scss']
})
export class DetailsSaleComponent {

  constructor(private form: ContractForm) { }

  get partiesForm(){
    return this.form.get('parties')
  }

  get getVersions() {
    return this.form.get('versions');
  }

  public getTerms(index: number){
    return this.getVersions.at(index).get('scope');
  }
}
