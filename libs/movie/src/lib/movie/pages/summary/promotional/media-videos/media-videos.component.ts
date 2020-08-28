import { Component, Input } from '@angular/core';
import { MovieFormShellComponent } from '../../../shell/shell.component';
import { MovieForm } from '@blockframes/movie/form/movie.form';

@Component({
  selector: '[movie][link] movie-summary-media-videos',
  templateUrl: './media-videos.component.html',
  styleUrls: ['./media-videos.component.scss']
})
export class SummaryMediaVideosComponent {

  form = this.shell.form;
  @Input() movie: MovieForm;
  @Input() link: string;

  constructor(private shell: MovieFormShellComponent) { }

}
