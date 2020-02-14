import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ContractTunnelComponent } from '../contract-tunnel.component';

@Component({
  selector: 'contract-details-mandate',
  templateUrl: './details-mandate.component.html',
  styleUrls: ['./details-mandate.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DetailsMandateComponent implements OnInit {

  constructor(private tunnel: ContractTunnelComponent) { }

  ngOnInit() {
  }

  get parties() {
    return this.tunnel.contractForm.get('parties')
  }

  get versions() {
    return this.tunnel.contractForm.get('versions');
  }

  get placeholderText() {
    return 'Any actual, direct, third-party, out-of-pocket expenses (which shall exclude overhead) will be recouped if they are incurred for the exploitation of the film(s) in connection with Technical, Marketing, Delivery or Translation will be recouped on Net Receipts. Net Receipts are calculated on 100% of the Gross Receipts excluding taxes, Commission being deducted.'
  }

  public terms(index: number) {
    return this.versions.at(index).get('scope');
  }

  public conditions(index: number) {
    return this.versions.at(index).get('renewalConditions')
  }

  public terminations(index: number) {
    return this.versions.at(index).get('terminationConditions');
  }

  public price(index: number) {
    return this.versions.at(index).get('price');
  }

  public fees(index: number) {
    return this.versions.at(index).get('authorizedRecoupableExpenses')
  }
}
