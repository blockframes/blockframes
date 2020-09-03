import { Component, OnInit, Input, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { OriginalReleaseForm } from '../sales-info.form';
import { startWith } from 'rxjs/operators';
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
  @Input() countriesForm;
  private sub: Subscription;

  // We want a specific selection
  media = [
    { 'slug': 'pay-tv', 'label': 'Pay TV' },
    { 'slug': 'free-tv', 'label': 'Free TV' },
    { 'slug': 'a-vod', 'label': 'A-VOD' },
    { 'slug': 's-vod', 'label': 'S-VOD' },
    { 'slug': 'theatrical', 'label': 'Theatrical' },
    { 'slug': 'video', 'label': 'Video' }
  ];

  constructor() {}

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
