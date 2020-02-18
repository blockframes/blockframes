import { Component, OnInit, Input, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { OriginalReleaseForm } from '../sales-info.form';
import { MovieForm } from '../../movie.form';
import { startWith } from 'rxjs/operators';
import { default as staticModel, ExtractCode } from '@blockframes/utils/static-model/staticModels';
import { MovieMainControl } from '../../main/main.form';
import { MovieSalesInfoControl } from '../sales-info.form'
import { Subscription } from 'rxjs';

@Component({
  selector: 'movie-form-original-releases',
  templateUrl: './original-releases.component.html',
  styleUrls: ['./original-releases.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OriginalReleaseComponent implements OnInit, OnDestroy {

  @Input() releasesForm: MovieSalesInfoControl['originalRelease'];
  @Input() countriesForm: MovieMainControl['originCountries'];
  private sub: Subscription;
  media = staticModel.MEDIAS;

  constructor() { }

  get originalRelease() {
    return this.releasesForm;
  }

  get originCountries() {
    return this.countriesForm;
  }

  ngOnInit() {
    this.sub = this.originCountries.valueChanges.pipe(
      startWith(this.originCountries.value),
    ).subscribe(countries => {
      countries.forEach((country, i: number) => {
        if (!this.originalRelease.at(i)) {
          this.originalRelease.setControl(i, new OriginalReleaseForm())
        }
        this.originalRelease.at(i).patchValue({ country })
      });
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  add() {
    this.originCountries.add();
    this.originalRelease.add();
  }

  remove(i: number) {
    this.originCountries.removeAt(i);
    this.originalRelease.removeAt(i);
  }
}
