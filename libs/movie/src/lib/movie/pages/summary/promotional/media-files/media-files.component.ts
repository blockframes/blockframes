import { Component, Input } from '@angular/core';
import { MovieFormShellComponent } from '../../../shell/shell.component';
import { MovieForm } from '@blockframes/movie/form/movie.form';

@Component({
  selector: '[movie][link] movie-summary-media-files',
  templateUrl: './media-files.component.html',
  styleUrls: ['./media-files.component.scss']
})
export class SummaryMediaFilesComponent {

  form = this.shell.form;
  @Input() movie: MovieForm;
  @Input() link: string;

  constructor(private shell: MovieFormShellComponent) { }

}
