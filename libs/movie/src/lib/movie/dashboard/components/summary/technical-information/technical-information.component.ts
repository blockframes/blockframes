// Angular
import {
  Component,
  ChangeDetectionStrategy,
  Input
} from '@angular/core';

// Form
import { MovieForm } from '../../../../form/movie.form';

@Component({
  selector: '[movie] movie-summary-technical-information',
  templateUrl: './technical-information.component.html',
  styleUrls: ['./technical-information.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieSummaryTechnicalInformationComponent {
  @Input() movie: MovieForm;
  @Input() link: string;

  get hasKeys() {
    return Object.keys(this.movie.controls).length;
  }
}
