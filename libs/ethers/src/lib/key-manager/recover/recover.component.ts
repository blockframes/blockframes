import { Component, ChangeDetectionStrategy, OnInit, Inject } from '@angular/core';

import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { KeyManagerService } from '../+state';
import { RecoverForm } from '../forms/recover.form';
import { XorControlsStateMatcher } from '@blockframes/utils';

export interface ImportKeyData {
  ensDomain: string,
}

type ImportType = 'mnemonic' | 'private-key';

@Component({
  selector: 'key-manager-recover',
  templateUrl: './recover.component.html',
  styleUrls: ['./recover.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecoverComponent implements OnInit {
  form: RecoverForm;
  public xorControlsMatcher: XorControlsStateMatcher;

  constructor(
    private service: KeyManagerService,
    private dialog: MatDialogRef<RecoverComponent>,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: ImportKeyData
  ) { }

  ngOnInit() {
    this.form = new RecoverForm();
    this.xorControlsMatcher = new XorControlsStateMatcher('mnemonic','privateKey');
  }


  cancel() {
    this.dialog.close(false);
  }

  async recover(importType: ImportType) {
    if (!this.form.valid) {
      this.snackBar.open('Invalid values', 'close', { duration: 1000 });
      this.dialog.close(false);
      return;
    }
    const { importValue, password } = this.form.value;
    switch (importType) {
      case 'mnemonic':
        this.service.importFromMnemonic(this.data.ensDomain, importValue, password);
        break;
      case 'private-key':
        this.service.importFromPrivateKey(this.data.ensDomain, importValue, password);
        break;
      default:
        this.dialog.close(false);
        throw new Error('There should be either a mnemonic or a private key but none was provided !');
    }
    this.dialog.close(true);
  }

  fromFile(event: Uint8Array) {
    const jsonString = new TextDecoder('utf8').decode(event);
    this.service.importFromJsonFile(jsonString);
    this.dialog.close(true);
  }
}
