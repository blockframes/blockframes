import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';
import { OriginalReleaseForm } from '../sales-info.form';
import { MovieForm } from '../../movie.form';
import { startWith } from 'rxjs/operators';

@Component({
  selector: 'movie-form-original-releases',
  templateUrl: './original-releases.component.html',
  styleUrls: ['./original-releases.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OriginalReleaseComponent implements OnInit {

  @Input() movieForm: MovieForm;

  constructor() { }

  get originalRelease() {
    return this.movieForm.get('salesInfo').get('originalRelease');
  }

  get originCountries() {
    return this.movieForm.get('main').get('originCountries');
  }

  ngOnInit() {
    this.originCountries.valueChanges.pipe(
      startWith(this.originCountries.value)
    ).subscribe((countries: string[]) => {
      countries.forEach((country, i) => this.originalRelease.setControl(i, new OriginalReleaseForm({ country })));
    });
  }

}
