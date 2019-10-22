import { Component, ChangeDetectionStrategy, Input, EventEmitter, Output } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { Key } from "../../types";

@Component({
  selector: 'key-manager-item',
  templateUrl: './key-manager-item.component.html',
  styleUrls: ['./key-manager-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KeyManagerItemComponent {

  /** Key which is getting set by the input setter function */
  public keyObject: Key;

  /** Background color string for generic background depending on the wallet address */
  public backgroundColor: string;
  public foregroundColor: string;

  @Input()
  set key(key: Key) {
    this.keyObject = key;
    this.backgroundColor = this.setBackgroundColor(key.address);
  }

  /** Flag to indicate how to display the key card */
  @Input() isSmall = false;

  /** Event to indicate the parent component which key is selected */
  @Output() selectKey = new EventEmitter();

  /** Event to indicate the parent component which key should be deleted */
  @Output() deleteKey = new EventEmitter();

  /** Event to indicate the parent component it should link this key to the user's ERC1077 */
  @Output() linkKey = new EventEmitter();

  constructor(
    private sanitizer: DomSanitizer
  ){}

  /** create a name for the downloadable file */
  get keyName() {
    return `${this.keyObject.ensDomain}_${this.keyObject.name}.json`;
  }

  /** create a downloadable data blob (json file) from this key */
  public jsonKeystore() {
    const data = new Blob([JSON.stringify(this.keyObject)], { type: 'application/octet-stream' });
    const url = window.URL.createObjectURL(data);
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  /** Get the 6 digits after the second index of the ethereum address to set the background color  */
  private setBackgroundColor(ethAddress: string) {
    const firstIndexIsF = this.keyObject.address.substring(2, 8).charAt(1) === 'f';
    const secondIndexIsF = this.keyObject.address.substring(2, 8).charAt(2) === 'f';
    return firstIndexIsF && secondIndexIsF ? '#0f17ff' : '#' + ethAddress.substring(2, 8);
  }
}
