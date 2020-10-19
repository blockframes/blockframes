import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { MovieFormShellComponent } from '../shell/shell.component';
import { Observable } from 'rxjs';
import { unitBox, UnitBox, certifications } from '@blockframes/utils/static-model';
import { startWith, map } from 'rxjs/operators';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';

function toUnit(unit: UnitBox) {
  switch (unit) {
    case 'usd': return '$'
    case 'eur': return '€'
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
  form = this.shell.getForm('movie');
  unitBox = unitBox;
  units$: Observable<Unit[]>;
  certifications = Object.keys(certifications).filter(cert =>
    (cert !== 'awardedFilm' && cert !== 'aListCast'));


  public qualificationsColumns = {
    certifications: "Qualifications",
  }

  constructor(private shell: MovieFormShellComponent, private dynTitle: DynamicTitleService) {
    this.dynTitle.setPageTitle('Additional Information')
  }

  ngOnInit() {
    this.units$ = this.form.boxOffice.valueChanges.pipe(
      startWith(this.form.boxOffice.value),
      map((boxOffices) => boxOffices.map(({ unit }) => toUnit(unit)))
    );
  }
}
