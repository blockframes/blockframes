import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ControlContainer } from '@angular/forms';
import { MovieStoryForm } from './story.form';


@Component({
  selector: '[formGroup] movie-form-story, [formGroupName] movie-form-story',
  templateUrl: './story.component.html',
  styleUrls: ['./story.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieFormStoryComponent {
  
  constructor(public controlContainer: ControlContainer) { }

  get story() : MovieStoryForm {
    return this.controlContainer.control as MovieStoryForm;
  }


}
