import { Component, Input } from '@angular/core';
import { MovieForm } from '@blockframes/movie/form/movie.form';

@Component({
  selector: '[movie][link] movie-summary-media-files',
  templateUrl: './media-files.component.html',
  styleUrls: ['./media-files.component.scss']
})
export class SummaryMediaFilesComponent {

  @Input() movie: MovieForm;
  @Input() link: string;

}
