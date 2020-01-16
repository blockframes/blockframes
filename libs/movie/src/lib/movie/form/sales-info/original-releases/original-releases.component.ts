import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';
import { OriginalReleaseForm } from '../sales-info.form';
import { MovieForm } from '../../movie.form';
import { startWith } from 'rxjs/operators';
import { default as staticModel, ExtractCode } from '../../../static-model/staticModels';
import { MovieMainControl } from '../../main/main.form';
import { MovieSalesInfoControl } from '../sales-info.form'

@Component({
  selector: 'movie-form-original-releases',
  templateUrl: './original-releases.component.html',
  styleUrls: ['./original-releases.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OriginalReleaseComponent implements OnInit {

  @Input() releasesForm: MovieSalesInfoControl['originalRelease'];
  @Input() countriesForm: MovieMainControl['originCountries'];
  media = staticModel.MEDIAS;

  constructor() { }

  get originalRelease() {
    return this.releasesForm;
  }

  get originCountries() {
    return this.countriesForm;
  }

  ngOnInit() {
    this.originCountries.valueChanges.pipe(
      startWith(this.originCountries.value),
    ).subscribe(countries => {
      countries.forEach((country: any, i: number) => {
        const control = this.originalRelease.createControl({ country });
        this.originalRelease.setControl(i, control);
      });
    });
  }

  // Remove cannot be automated by valueChange or it would resul into bad UX (remove form when input is emptied)
  remove(i: number) {
    this.originCountries.removeAt(i);
    this.originalRelease.removeAt(i);
  }
}
