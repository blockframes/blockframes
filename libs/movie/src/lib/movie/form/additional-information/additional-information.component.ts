import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { MovieFormShellComponent } from '../shell/shell.component';
import { Observable } from 'rxjs';
import { staticConsts, UnitBox } from '@blockframes/utils/static-model';
import { startWith, map } from 'rxjs/operators';
import { staticModels } from '@blockframes/utils/static-model';

function toUnit(unit: UnitBox) {
  switch (unit) {
    case 'usDollar': return '$'
    case 'euro': return '€'
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
  unitBox = staticConsts.unitBox;
  units$: Observable<Unit[]>;
  certifications = staticModels.CERTIFICATIONS.filter(cert =>
    (cert.slug !== 'awarded-film' && cert.slug !== 'a-list-cast'));


  public qualificationsColumns = {
    certifications: "Qualifications",
  }

  constructor(private shell: MovieFormShellComponent) { }

  ngOnInit() {
    this.units$ = this.form.boxOffice.valueChanges.pipe(
      startWith(this.form.boxOffice.value),
      map((boxOffices) => boxOffices.map(({ unit }) => toUnit(unit)))
    );
  }
}
