import { ChangeDetectionStrategy, Component, Input, OnInit, OnChanges } from '@angular/core';

@Component({
  selector: 'financing-range-slider',
  templateUrl: './range-slider.component.html',
  styleUrls: ['./range-slider.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FinancingRangeSliderComponent implements OnInit {
  @Input() min = 0;
  @Input() max = 100;
  @Input() step = 1;
  @Input() value: number;
  @Input() placeholder: string;
  @Input() valueOffset = 20;
  @Input() unit: string;
  @Input() unitSide = 'none';
  constructor() {}
  ngOnInit() {
    if (!this.value) this.value = this.min;
  }
}