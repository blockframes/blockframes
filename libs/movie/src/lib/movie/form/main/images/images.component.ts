import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { MovieMainForm } from '../main.form';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: '[form] movie-form-images',
  templateUrl: './images.component.html',
  styleUrls: ['./images.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieFormImagesComponent {
    public movieId = this.route.snapshot.params.movieId;

  @Input() form: MovieMainForm;

  constructor(private route: ActivatedRoute) {

  }

  get title() {
    return this.form.get('title');
  }

  get storeType() {
    return this.form.get('storeConfig').get('storeType');
  }
}
