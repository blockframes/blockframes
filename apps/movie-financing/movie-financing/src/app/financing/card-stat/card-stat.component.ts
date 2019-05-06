import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'financing-card-stat',
  templateUrl: './card-stat.component.html',
  styleUrls: ['./card-stat.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardStatComponent implements OnInit {
  @Input() icon: string;
  @Input() name: string;
  @Input() subtitle: string;
  @Input() value: string;

  constructor() {
  }

  ngOnInit() {
  }
}
