import { Component, OnInit, ChangeDetectionStrategy, Output, EventEmitter } from "@angular/core";
import { MatSnackBar } from '@angular/material/snack-bar';
import { Key } from "../../key-manager/+state";
import { FormControl, FormGroup } from "@angular/forms";

@Component({
  selector: 'wallet-import-key-form',
  templateUrl: './wallet-import-key-form.component.html',
  styleUrls: ['./wallet-import-key-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WalletImportKeyFormComponent {

  isMnemonic = false;
  keyObject: Key;
  mnemonic = '';
  mnemonicField = new FormControl(''); // TODO use Max's custom mnemonic control
  
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
    } catch(err) {
      this.snackBar.open(`Ooops : ${err}`, 'close', { duration: 1000 });
    }
  }

  import() {
    this.isMnemonic
      ? this.importMnemonic.emit(this.mnemonic)
      : this.importKey.emit(this.keyObject);
  }
}