import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { Investor } from '../model';

@Component({
  selector: 'financing-card-blacklist',
  templateUrl: './card-blacklist.component.html',
  styleUrls: ['./card-blacklist.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardBlacklistComponent implements OnInit {
  @Input() investor: Investor;

  constructor() {
  }

  ngOnInit() {
  }
}
