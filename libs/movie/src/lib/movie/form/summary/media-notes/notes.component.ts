import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MovieForm } from '../../../form/movie.form';

@Component({
  selector: '[movie][link]movie-summary-media-notes',
  templateUrl: 'notes.component.html',
  styleUrls: ['./notes.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SummaryMediaNotesComponent {
  @Input() movie: MovieForm;
  @Input() link: string;

  get notes() {
    return this.movie.promotional.get('notes');
  }

}
