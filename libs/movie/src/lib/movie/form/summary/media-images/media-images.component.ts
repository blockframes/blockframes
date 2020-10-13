import { Component, Input } from '@angular/core';
import { MovieForm } from '@blockframes/movie/form/movie.form';

@Component({
  selector: '[movie][link] movie-summary-media-images',
  templateUrl: './media-images.component.html',
  styleUrls: ['./media-images.component.scss']
})
export class SummaryMediaImagesComponent {

  @Input() movie: MovieForm;
  @Input() link: string;

  get stillPhoto() {
    return this.movie.promotional.get('still_photo');
  }
}
