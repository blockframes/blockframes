import { Component, OnInit, ChangeDetectionStrategy, Output, EventEmitter, Input } from "@angular/core";
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormControl, Validators } from "@angular/forms";
import { Key } from "../../../types";
import { validMnemonic } from "../../../validators";

@Component({
  selector: 'wallet-import-key-form',
  templateUrl: './wallet-import-key-form.component.html',
  styleUrls: ['./wallet-import-key-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WalletImportKeyFormComponent {

  fileUploaded = false;
  isMnemonic = false;
  keyObject: Key;
  mnemonic = new FormControl('', [Validators.required, validMnemonic]);

  @Input() lockMnemonic = false;
  @Output() importKey = new EventEmitter<Key>();
  @Output() importMnemonic = new EventEmitter<string>();

  constructor(private snackBar: MatSnackBar){}

  toggleMnemonic() {
    this.isMnemonic = !this.isMnemonic;
  }

  importedJson(jsonFile: Uint8Array) {
    try {
      const jsonString = new TextDecoder('utf-8').decode(jsonFile);
      this.keyObject = JSON.parse(jsonString);
      this.fileUploaded = true;
    } catch(err) {
      this.snackBar.open(`Ooops : ${err}`, 'close', { duration: 1000 });
    }
  }

  import() {
    this.isMnemonic
      ? this.importMnemonic.emit(this.mnemonic.value)
      : this.importKey.emit(this.keyObject);
  }

  get isDisabled() {
    return (!this.isMnemonic && !this.fileUploaded) || (this.isMnemonic && !this.mnemonic.valid);
  }
}
