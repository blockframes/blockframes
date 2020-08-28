import { Component, Input } from '@angular/core';
import { MovieForm } from '@blockframes/movie/form/movie.form';
import { MovieFormShellComponent } from '../../shell/shell.component';

@Component({
  selector: '[movie][link] movie-summary-storyline',
  templateUrl: './storyline.component.html',
  styleUrls: ['./storyline.component.scss']
})
export class SummaryStorylineComponent {

  form = this.shell.form;
  @Input() movie: MovieForm;
  @Input() link: string;

  constructor(private shell: MovieFormShellComponent) { }

}
