import { ContractForm } from '@blockframes/contract/contract/form/contract.form';
import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { ContractTunnelComponent } from '../contract-tunnel.component';

@Component({
  selector: 'contract-details-sale',
  templateUrl: './details-sale.component.html',
  styleUrls: ['./details-sale.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DetailsSaleComponent implements OnInit {
  private form: ContractForm;
  constructor(private tunnel: ContractTunnelComponent) { }

  ngOnInit() {
    this.form = this.tunnel.contractForm;
    if (this.parties.controls.length <= 1) {
      this.parties.add({ party: { role: 'undefined' } })
    }
  }

  get parties() {
    return this.form.get('parties')
  }

  get versions() {
    return this.form.get('versions');
  }

  public terms(index: number) {
    return this.versions.at(index).get('scope');
  }

  public price(index: number) {
    return this.versions.at(index).get('price');
  }
}
