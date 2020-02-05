import { Component, ChangeDetectionStrategy, Host, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ContractForm } from '../forms/contract.form';
import { ContractQuery, ContractService } from '../+state';
import { TunnelStep } from '@blockframes/ui/tunnel'

@Component({
  selector: 'contract-tunnel',
  templateUrl: './contract-tunnel.component.html',
  styleUrls: ['./contract-tunnel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ContractForm]
})
export class ContractTunnelComponent implements OnInit {

  constructor(
    @Host() private form: ContractForm,
    private snackBar: MatSnackBar,
    private service: ContractService,
    private query: ContractQuery,
  ) {}

  async ngOnInit() {
    const contract = this.query.getActive();
    this.form.patchAllValue(contract);
  }

  // Should save movie
  public async save() {
    const id = this.query.getActiveId();
    await this.service.update({ id, ...this.form.value });
    this.snackBar.open('Saved', 'close', { duration: 500 });
  }
}
