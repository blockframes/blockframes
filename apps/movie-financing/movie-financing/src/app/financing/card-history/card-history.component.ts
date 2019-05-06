import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'financing-card-history',
  templateUrl: './card-history.component.html',
  styleUrls: ['./card-history.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardHistoryComponent implements OnInit {
  @Input() icon: string;
  @Input() date: string;
  @Input() time: string;
  @Input() action: string;

  constructor() {
  }

  ngOnInit() {
  }
}
