import { Component, ChangeDetectionStrategy, Input, ChangeDetectorRef, OnInit } from '@angular/core';
import { MovieForm } from '../../movie.form';

@Component({
  selector: '[form] movie-summary-image',
  templateUrl: './image.component.html',
  styleUrls: ['./image.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieSummaryImageComponent implements OnInit {
  @Input() form: MovieForm;
  @Input() link: string;

  constructor(private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.form.promotionalElements.valueChanges.subscribe(_ => this.cdr.markForCheck());
  }

  get photoHasNoValue() {
    try {
      const stillPhotos = this.form.promotionalElements.get('still_photo').value;
      const keys = Object.keys(stillPhotos);

      // if there is no still photos
      return keys.length === 0 ?
        true :
        // or if at least one still photo as an empty url
        keys.some(key => !this.form.promotionalElements.get('still_photo').value[key].media.original.url.value);

    } catch (error) {
      console.warn(error);
      return true;
    }
  }
}
