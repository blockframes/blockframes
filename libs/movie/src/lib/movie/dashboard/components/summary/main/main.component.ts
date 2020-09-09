import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { MovieForm, DirectorForm } from '../../../../form/movie.form';

@Component({
  selector: '[movie] movie-summary-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieSummaryMainComponent {
  @Input() movie: MovieForm;
  @Input() link: string;

  public directorHasErrorRequired(director: DirectorForm) {
    return director.get('firstName').hasError('required') || director.get('lastName').hasError('required');
  }
}
