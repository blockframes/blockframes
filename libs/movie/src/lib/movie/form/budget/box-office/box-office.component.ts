import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';
import { BudgetFormControl } from '../budget.form';
import { UnitBox, unitBox } from '@blockframes/movie/+state/movie.firestore';
import { Observable } from 'rxjs';

function toUnit(unit: UnitBox) {
  switch (unit) {
    case 'boxoffice_dollar': return '$'
    case 'boxoffice_euro': return '€'
    case 'admissions': return 'admissions'
  }
}
type Unit = ReturnType<typeof toUnit>;


@Component({
  selector: '[form] movie-form-box-office, [formGroup] movie-form-box-office',
  templateUrl: './box-office.component.html',
  styleUrls: ['./box-office.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BoxOfficeComponent implements OnInit {
  @Input() form: BudgetFormControl['boxOffice'];
  unitBox = unitBox;
  units$: Observable<Unit[]>;

  constructor() { }

  ngOnInit() {
    // this.units$ = this.form.valueChanges.pipe(
    //   startWith(this.form.value),
    //   map((boxOffices) => boxOffices.map(({ unit }) => toUnit(unit)))
    // );
  }

}
