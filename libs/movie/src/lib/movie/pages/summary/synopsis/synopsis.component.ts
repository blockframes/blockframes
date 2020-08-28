import { Component, Input } from '@angular/core';
import { MovieForm } from '@blockframes/movie/form/movie.form';
import { MovieFormShellComponent } from '../../shell/shell.component';

@Component({
  selector: '[movie][link] movie-summary-synopsis',
  templateUrl: './synopsis.component.html',
  styleUrls: ['./synopsis.component.scss']
})
export class SummarySynopsisComponent {

  form = this.shell.form;
  @Input() movie: MovieForm;
  @Input() link: string;

  constructor(private shell: MovieFormShellComponent) { }

}
