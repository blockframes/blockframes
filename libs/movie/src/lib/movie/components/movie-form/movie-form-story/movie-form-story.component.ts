import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MovieForm } from '../movie.form';

@Component({
  selector: 'movie-form-story',
  templateUrl: './movie-form-story.component.html',
  styleUrls: ['./movie-form-story.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieFormStoryComponent {

  public readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  constructor(public form: MovieForm) {}
}
