import { Component, OnInit, Input } from '@angular/core';
import { MovieBudgetForm } from '../budget.form';
import { UnitBox } from '@blockframes/movie/movie+state/movie.firestore';

@Component({
  selector: '[form] movie-form-box-office, [formGroup] movie-form-box-office',
  templateUrl: './box-office.component.html',
  styleUrls: ['./box-office.component.scss']
})
export class BoxOfficeComponent implements OnInit {
  @Input() form: MovieBudgetForm;
  private unitBox = UnitBox;

  constructor() { }

  ngOnInit() {
    console.log(this.form.value);
  }

  get unitBoxList() {
    return Object.keys(this.unitBox);
  }
}
