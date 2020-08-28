import { Component, Input } from '@angular/core';
import { MovieForm } from '@blockframes/movie/form/movie.form';
import { MovieFormShellComponent } from '../../shell/shell.component';

@Component({
  selector: '[movie][link] movie-summary-technical-info',
  templateUrl: './technical-info.component.html',
  styleUrls: ['./technical-info.component.scss']
})
export class SummaryTechnicalInfoComponent {

  form = this.shell.form;
  @Input() movie: MovieForm;
  @Input() link: string;

  constructor(private shell: MovieFormShellComponent) { }

}
