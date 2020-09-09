// Angular
import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

// Form
import { MovieForm } from '../../../../form/movie.form';

@Component({
  selector: '[movie] movie-summary-story',
  templateUrl: './story.component.html',
  styleUrls: ['./story.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieSummaryStoryComponent {

  public separatorKeysCodes = [ENTER, COMMA]

  @Input() movie: MovieForm;
  @Input() link: string;
}
