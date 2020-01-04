import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ControlContainer, FormControl } from '@angular/forms';


@Component({
  selector: '[formControl] movie-form-synopsis, [formControlName] movie-form-synopsis, movie-form-synopsis',
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
