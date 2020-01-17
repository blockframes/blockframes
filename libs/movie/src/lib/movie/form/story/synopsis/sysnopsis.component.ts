import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { MovieStoryControl } from '../story.form';
@Component({
  selector: '[form] movie-form-synopsis',
  templateUrl: './synopsis.component.html',
  styleUrls: ['./synopsis.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SynopsisComponent{

  @Input() form: MovieStoryControl['synopsis'];
}
