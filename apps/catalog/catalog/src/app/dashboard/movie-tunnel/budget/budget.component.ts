import { Component, OnInit } from '@angular/core';
import { MovieForm } from '@blockframes/movie/movie/form/movie.form';

@Component({
  selector: 'movie-tunnel-budget',
  templateUrl: './budget.component.html',
  styleUrls: ['./budget.component.scss']
})
export class BudgetComponent implements OnInit {

  constructor(private form: MovieForm) { }

  get budget() {
    return this.form.get('budget');
  }

  ngOnInit() {
  }

}
