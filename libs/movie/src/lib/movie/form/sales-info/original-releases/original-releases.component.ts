import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';
import { OriginalReleaseForm } from '../sales-info.form';
import { MovieForm } from '../../movie.form';
import { startWith } from 'rxjs/operators';
import { default as staticModel } from '../../../static-model/staticModels';

@Component({
  selector: 'movie-form-original-releases',
  templateUrl: './original-releases.component.html',
  styleUrls: ['./original-releases.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OriginalReleaseComponent implements OnInit {

  @Input() movieForm: MovieForm;
  media = staticModel.MEDIAS;

  constructor() { }

  get originalRelease() {
    return this.movieForm.get('salesInfo').get('originalRelease');
  }

  get originCountries() {
    return this.movieForm.get('main').get('originCountries');
  }

  ngOnInit() {
    this.originCountries.valueChanges.pipe(
      startWith(this.originCountries.value),
    ).subscribe((countries: string[]) => {
      countries.forEach((country, i) => {
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
