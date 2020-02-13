import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';
import { BudgetFormControl } from '../budget.form';
import { UnitBox } from '@blockframes/movie/movie/+state/movie.firestore';
import { startWith, map } from 'rxjs/operators';
import { Observable } from 'rxjs';

function toUnit(unit: UnitBox) {
  switch (unit) {
    case UnitBox.boxoffice_dollar: return '$'
    case UnitBox.boxoffice_euro: return '€'
    case UnitBox.entrances: return 'entrances'
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
  unitBox = UnitBox;
  units$: Observable<Unit[]>;

  constructor() { }

  ngOnInit() {
    this.units$ = this.form.valueChanges.pipe(
      startWith(this.form.value),
      map((boxOffices) => boxOffices.map(({ unit }) => toUnit(unit)))
    );
  }

}
