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

  public objectHasNoValue(valueAsRecord: Record<any, any>) {
    try {
      const objectToCheck = valueAsRecord.value;
      const keys = Object.keys(objectToCheck);
      return keys.length === 0 ? true : keys.some(key => !objectToCheck[key]);
    } catch (error) {
      console.warn(error);
      return true;
    }
  }
}
