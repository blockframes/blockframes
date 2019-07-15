import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  Input,
  EventEmitter,
  Output
} from '@angular/core';
import { Key, KeyManagerService } from '../+state';
import { keyToAddressPart, AddressParts } from '@blockframes/utils';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'key-manager-item',
  templateUrl: './key-manager-item.component.html',
  styleUrls: ['./key-manager-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KeyManagerItemComponent implements OnInit {
  public address: AddressParts;

  /** Key which is getting set by the input setter function */
  public keyObject: Key;

  /** Background color string for generic background depending on the wallet address */
  public backgroundColor: string;

  @Input()
  set key(key: Key) {
    this.keyObject = key;
    this.backgroundColor = this.setBackgroundColor(key.address);
  }

  /** Flag to indicate how to presentate the key card */
  @Input() isSmall = false;

  /** Event to indicate the parent component which key is selected */
  @Output() selectedKey: EventEmitter<Key> = new EventEmitter();

  /** Event to indicate the parent component which key should be deleted */
  @Output() deleteKeyEvent: EventEmitter<Key> = new EventEmitter();

  constructor(
    private service: KeyManagerService,
    private sanitizer: DomSanitizer,
  ) {
  }

  ngOnInit() {
    this.address = keyToAddressPart(this.keyObject, 6);
  }

  lockKey() {
    this.service.deactivateKey();
  }

  async deleteKey() {
    this.service.deleteKey(this.keyObject);
  }

  async exportKey() {
    this.service.exportActiveKey();
  }

  get keyName() {
    return `key_${this.keyObject.ensDomain}_${this.address.start}_${this.address.end}.json`;
  }

  /** create a downloadable data blob (json file) from this key */
  get jsonKeystore() {
    const res = new Blob([JSON.stringify(this.key)], { type: 'application/octet-stream' });
    // here we bypass security to prevent angular from escaping our data
    return this.sanitizer.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(res));
  }

  /** Get the 6 digits after the second index of the ethereum address to set the background color  */
  private setBackgroundColor(ethAddress: string): string {
    const firstIndexIsF = this.keyObject.address.substring(2, 8).charAt(1) === 'f';
    const secondIndexIsF = this.keyObject.address.substring(2, 8).charAt(2) === 'f';
    return firstIndexIsF && secondIndexIsF ? '#0f17ff' : ethAddress.substring(2, 8);
  }
}
