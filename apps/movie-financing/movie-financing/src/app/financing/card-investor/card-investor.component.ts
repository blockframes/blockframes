import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { Investor } from '../model';

@Component({
  selector: 'financing-card-investor',
  templateUrl: './card-investor.component.html',
  styleUrls: ['./card-investor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardInvestorComponent implements OnInit {
  @Input() investor: Investor;

  constructor() {
  }

  ngOnInit() {
  }
}
