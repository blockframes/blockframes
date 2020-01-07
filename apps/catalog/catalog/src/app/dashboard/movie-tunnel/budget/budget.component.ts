import { Component, OnInit } from '@angular/core';
import { MovieForm } from '@blockframes/movie/form/movie.form';

@Component({
  selector: 'catalog-movie-tunnel-budget',
  templateUrl: './budget.component.html',
  styleUrls: ['./budget.component.scss']
})
export class BudgetComponent implements OnInit {

  constructor(private form: MovieForm) { }

  get estimatedBudget() {
    return this.form.get('budget').get('estimatedBudget');
  }

  get certifications() {
    return this.form.get('salesInfo').get('certifications');
  }

  ngOnInit() {
  }

}
