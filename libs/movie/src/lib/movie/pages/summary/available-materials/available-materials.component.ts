import { Component, Input } from '@angular/core';
import { MovieForm } from '@blockframes/movie/form/movie.form';

@Component({
  selector: '[movie][link] movie-summary-available-materials',
  templateUrl: './available-materials.component.html',
  styleUrls: ['./available-materials.component.scss']
})
export class SummaryAvailableMaterialsComponent {

  @Input() movie: MovieForm;
  @Input() link: string;

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
