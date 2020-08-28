import { Component, Input } from '@angular/core';
import { MovieFormShellComponent } from '../../shell/shell.component';
import { MovieForm } from '@blockframes/movie/form/movie.form';

@Component({
  selector: '[movie][link] movie-summary-production',
  templateUrl: './production.component.html',
  styleUrls: ['./production.component.scss']
})
export class SummaryProductionComponent {

  form = this.shell.form;
  @Input() movie: MovieForm;
  @Input() link: string;

  constructor(private shell: MovieFormShellComponent) { }

}
