import { Component, Input } from '@angular/core';
import { MovieFormShellComponent } from '../../shell/shell.component';
import { MovieForm } from '@blockframes/movie/form/movie.form';

@Component({
  selector: '[movie][link] movie-summary-additional-information',
  templateUrl: './additional-information.component.html',
  styleUrls: ['./additional-information.component.scss']
})
export class SummaryAdditionalInformationComponent {

  form = this.shell.form;
  @Input() movie: MovieForm;
  @Input() link: string;

  constructor(private shell: MovieFormShellComponent) { }

}
