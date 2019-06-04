import { Component, ChangeDetectionStrategy, OnInit, Input } from "@angular/core";
import { Key, KeyManagerService } from "../+state";
import { keyToAddressPart, AddressParts } from "@blockframes/utils";
import { DomSanitizer } from "@angular/platform-browser";

@Component({
  selector: 'key-manager-item',
  templateUrl: './key-manager-item.component.html',
  styleUrls: ['./key-manager-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KeyManagerItemComponent implements OnInit {
  @Input() key: Key;
  @Input() active = false;

  address: AddressParts;

  constructor(
    private service: KeyManagerService,
    private sanitizer: DomSanitizer
  ){}

  ngOnInit() {
    this.address = keyToAddressPart(this.key, 6);
  }

  async unlockKey() {
    this.service.unlockAndSetActive(this.key);
  }

  lockKey() {
    this.service.deactivateKey();
  }

  async deleteKey() {
    this.service.deleteKey(this.key);
  }

  async exportKey() {
    this.service.exportActiveKey();
  }

  get keyName() {
    return `key_${this.key.ensDomain}_${this.address.start}_${this.address.end}.json`;
  }

  /** create a downloadable data blob (json file) from this key */
  get jsonKeystore() {
    const res = new Blob([JSON.stringify(this.key)], { type: 'application/octet-stream' });
    return this.sanitizer.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(res)); // here we bypass security to prevent angular from escaping our data
  }
}
