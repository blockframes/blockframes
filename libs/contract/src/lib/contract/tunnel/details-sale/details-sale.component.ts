import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ContractTunnelComponent } from '../contract-tunnel.component';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'contract-details-sale',
  templateUrl: './details-sale.component.html',
  styleUrls: ['./details-sale.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DetailsSaleComponent {

  constructor(private tunnel: ContractTunnelComponent, private title: Title) {
    this.title.setTitle('Create a contract offer - Overview - Archipel Content')
  }

  get parties() {
    return this.tunnel.contractForm.get('parties')
  }

  get versions() {
    return this.tunnel.contractForm.get('versions');
  }

  public terms(index: number) {
    return this.versions.at(index).get('scope');
  }
}
