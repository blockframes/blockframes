import { Component, ChangeDetectionStrategy, OnInit, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { KeyManagerService } from '../+state';

function samePassword(control: FormGroup) { // TODO ISSUE #408
  const { password, confirm } = control.value;
  return password === confirm
    ? null
    : { notSame: true }
}

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
  form: FormGroup;

  constructor(
    private service: KeyManagerService,
    private dialog: MatDialogRef<RecoverComponent>,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: ImportKeyData
  ) { }

  ngOnInit() {
    this.form = new FormGroup({
      importValue: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
      confirm: new FormControl('', [Validators.required])
    }, { validators: [samePassword] });
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
