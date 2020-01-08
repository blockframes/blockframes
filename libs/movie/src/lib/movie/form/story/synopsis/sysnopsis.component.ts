import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ControlContainer, FormControl } from '@angular/forms';


@Component({
  selector: '[formGroup] movie-form-synopsis, [formGroupName] movie-form-synopsis',
  templateUrl: './synopsis.component.html',
  styleUrls: ['./synopsis.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SynopsisComponent{

  constructor(private controlContainer: ControlContainer) {}

  get synopsis() : FormControl {
    return this.controlContainer.control as FormControl
  }
}
