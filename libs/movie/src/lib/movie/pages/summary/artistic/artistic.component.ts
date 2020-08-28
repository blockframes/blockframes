import { Component, Input } from '@angular/core';
import { MovieForm } from '@blockframes/movie/form/movie.form';
import { MovieFormShellComponent } from '../../shell/shell.component';

@Component({
  selector: '[movie][link] movie-summary-artistic',
  templateUrl: './artistic.component.html',
  styleUrls: ['./artistic.component.scss']
})
export class SummaryArtisticComponent {

  form = this.shell.form;
  @Input() movie: MovieForm;
  @Input() link: string;

  constructor(private shell: MovieFormShellComponent) { }


}
