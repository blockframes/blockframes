import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { MovieStory, createMovieStory } from '../../+state';

@Component({
  selector: '[movieStory] movie-display-story',
  templateUrl: './story.component.html',
  styleUrls: ['./story.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieDisplayStoryComponent {

  public data : MovieStory;
  @Input() set movieStory(movieStory: Partial<MovieStory>) {
    this.data = createMovieStory(movieStory);
  }

}
