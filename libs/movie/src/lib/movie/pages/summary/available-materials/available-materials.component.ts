import { Component, Input } from '@angular/core';
import { MovieForm } from '@blockframes/movie/form/movie.form';
import { MovieFormShellComponent } from '../../shell/shell.component';

@Component({
  selector: '[movie][link] movie-summary-available-materials',
  templateUrl: './available-materials.component.html',
  styleUrls: ['./available-materials.component.scss']
})
export class SummaryAvailableMaterialsComponent {

  form = this.shell.form;
  @Input() movie: MovieForm;
  @Input() link: string;

  constructor(private shell: MovieFormShellComponent) { }

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
