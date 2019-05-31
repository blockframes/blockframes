import { Component, ChangeDetectionStrategy, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Wallet as EthersWallet, utils } from 'ethers';

export interface ExportData {
  wallet: EthersWallet;
}

@Component({
  selector: 'key-manager-export',
  templateUrl: './export-dialog.component.html',
  styleUrls: ['./export-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExportComponent implements OnInit {

  constructor(
    private dialog: MatDialogRef<ExportComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ExportData
  ) {}

  ngOnInit() {

  }

  get privateKey() {
    return this.data.wallet.privateKey;
  }

  get mnemonic() {
    return utils.HDNode.entropyToMnemonic(this.privateKey);
  }

  close() {
    this.dialog.close();
  }
}
