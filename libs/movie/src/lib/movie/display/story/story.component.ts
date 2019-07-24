import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { MovieStory } from '../../+state';

@Component({
  selector: '[data] movie-display-story',
  templateUrl: './story.component.html',
  styleUrls: ['./story.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieDisplayStoryComponent {

  @Input() data: MovieStory;


}
