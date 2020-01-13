import { Component } from '@angular/core';
import { MovieForm } from '@blockframes/movie/movie/form/movie.form';

@Component({
  selector: 'catalog-movie-tunnel-evaluation',
  templateUrl: './evaluation.component.html',
  styleUrls: ['./evaluation.component.scss']
})
export class EvaluationComponent {

  constructor(private form: MovieForm) { }

  get salesInfo() {
    return this.form.get('salesInfo');
  }
}
