import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { Investor } from '../model';

@Component({
  selector: 'financing-card-view',
  templateUrl: './card-view.component.html',
  styleUrls: ['./card-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardViewComponent implements OnInit {
  @Input() investor: Investor;

  constructor() {
  }

  ngOnInit() {
  }
}

