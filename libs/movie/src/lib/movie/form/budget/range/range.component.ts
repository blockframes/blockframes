import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ControlContainer } from '@angular/forms';

@Component({
  selector: '[formGroup] movie-form-budget-range, [formGroupName] movie-form-budget-range',
  templateUrl: './range.component.html',
  styleUrls: ['./range.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RangeComponent {

  constructor(private controlContainer: ControlContainer) { }

  get range() {
    return this.controlContainer.control
  }

  ngOnInit() {
  }

}
