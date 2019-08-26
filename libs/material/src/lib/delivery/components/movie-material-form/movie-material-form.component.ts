import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ControlContainer } from '@angular/forms';

@Component({
  selector: '[formGroupName] movie-material-form,[formGroup] movie-material-form, movie-material-form',
  templateUrl: './movie-material-form.component.html',
  styleUrls: ['./movie-material-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class MovieMaterialFormComponent {
  constructor(public controlContainer: ControlContainer) {}

  public get control() {
    return this.controlContainer.control;
  }
}
