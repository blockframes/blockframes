import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { MovieFormShellComponent } from '../shell/shell.component';
import { Observable } from 'rxjs';
import { unitBox, UnitBox } from '@blockframes/movie/+state/movie.firestore';
import { startWith, map } from 'rxjs/operators';
import { staticModels } from '@blockframes/utils/static-model';

function toUnit(unit: UnitBox) {
  switch (unit) {
    case 'boxoffice_dollar': return '$'
    case 'boxoffice_euro': return '€'
    case 'admissions': return 'admissions'
  }
}
type Unit = ReturnType<typeof toUnit>;

@Component({
  selector: 'movie-form-additional-information',
  templateUrl: './additional-information.component.html',
  styleUrls: ['./additional-information.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovieFormAdditionalInformationComponent implements OnInit {
  form = this.shell.form;
  unitBox = unitBox;
  units$: Observable<Unit[]>;
  certifications = staticModels.CERTIFICATIONS.filter(cert =>
    (cert.slug !== 'awarded-film' && cert.slug !== 'a-list-cast'));

  constructor(private shell: MovieFormShellComponent) { }

  ngOnInit() {
    // TODO: Enable this, but the data-model is not properly set.
    // this.units$ = this.form.valueChanges.pipe(
    //   startWith(this.form.value),
    //   map((boxOffices) => boxOffices.map(({ unit }) => toUnit(unit)))
    // );
  }

  get qualifications() {
    return this.form.get('certifications');
  }

  get rating() {
    return this.form.get('rating');
  }

  get originalRelease() {
    return this.form.get('originalRelease');
  }

  get boxOffice() {
    return this.form.get('boxOffice');
  }
}
