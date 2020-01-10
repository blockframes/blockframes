import { FormControl } from '@angular/forms';
import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

@Component({
  selector: '[form] distribution-form-exclusivity',
  templateUrl: './exclusive.component.html',
  styleUrls: ['./exclusive.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DistributionDealExclusiveComponent {
  @Input() form: FormControl;
}
