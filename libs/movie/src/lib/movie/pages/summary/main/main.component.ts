import { Component, Input } from '@angular/core';
import { MovieFormShellComponent } from '../../shell/shell.component';
import { MovieForm } from '@blockframes/movie/form/movie.form';

@Component({
  selector: '[movie][link] movie-summary-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class SummaryMainComponent {

  form = this.shell.form;
  @Input() movie: MovieForm;
  @Input() link: string;

  constructor(private shell: MovieFormShellComponent) { }

  get title() {
    return this.form.get('title');
  }

  public get genres() {
    return [this.form.get('genres'), ...this.form.get('customGenres').controls];
  }

}
