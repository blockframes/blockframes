import { Component, ChangeDetectionStrategy, OnInit, Input } from "@angular/core";
import { Key, KeyManagerService } from "../+state";
import { keyToAddressPart, AddressParts } from "@blockframes/utils";

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
    private service: KeyManagerService
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
}
