import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ControlContainer, FormControl } from '@angular/forms';

@Component({
  selector: '[formGroup] movie-theatrical-release, [formGroupName] movie-theatrical-release',
  templateUrl: './theatrical-release.component.html',
  styleUrls: ['./theatrical-release.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TheatricalReleaseComponent {

  constructor(private controlContainer: ControlContainer) { }

  get theatricalRelease() : FormControl {
    return this.controlContainer.control as FormControl
  }

  get originCountryReleaseDate() : FormControl {
    return this.controlContainer.control as FormControl
  }
}
