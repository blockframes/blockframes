import { ChangeDetectionStrategy, Component, Input, OnInit, OnChanges } from '@angular/core';
import {default as createBlockie} from 'ethereum-blockies-base64';

@Component({
  selector: 'eth-blockie',
  templateUrl: './blockie.component.html',
  styleUrls: ['./blockie.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BlockieComponent implements OnInit, OnChanges {
  @Input() address = '0x0000000000000000000000000000000000000000';
  @Input() round = false;
  @Input() height = 100;
  @Input() width = 100;
  public blockie: string;
  public roundImg: string;
  constructor() {}
  ngOnInit() {
    this.setBlockie()
  }
  ngOnChanges() {
    this.setBlockie()
  }
  private setBlockie() {
    this.blockie = createBlockie(this.address);
    this.roundImg = this.round ? 'round-img' : '';
  }
}
