import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ControlContainer } from '@angular/forms';


@Component({
  selector: '[formGroup] movie-form-story, [formGroupName] movie-form-story',
  templateUrl: './story.component.html',
  styleUrls: ['./story.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieFormStoryComponent {

  constructor(public controlContainer: ControlContainer) { }

  get story() {
    return this.controlContainer.control;
  }


}
