import { Component, Input } from '@angular/core';
import { MovieFormShellComponent } from '../../../shell/shell.component';
import { MovieForm } from '@blockframes/movie/form/movie.form';

@Component({
  selector: '[movie][link] movie-summary-media-images',
  templateUrl: './media-images.component.html',
  styleUrls: ['./media-images.component.scss']
})
export class SummaryMediaImagesComponent {

  form = this.shell.form;
  @Input() movie: MovieForm;
  @Input() link: string;

  constructor(private shell: MovieFormShellComponent) { }

  get stillPhoto() {
    return this.form.promotional.get('still_photo');
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
