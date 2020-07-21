import { storeType, contentType } from '@blockframes/movie/+state/movie.firestore';
import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { default as staticModels } from '@blockframes/utils/static-model/staticModels';
import { MovieMainForm } from '../main.form';


@Component({
  selector: '[form] movie-form-general-information',
  templateUrl: './general-information.component.html',
  styleUrls: ['./general-information.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GeneralInformationComponent {
  public staticModels = staticModels;
  public freshness = storeType;
  public contentType = contentType;

  @Input() form: MovieMainForm;

  get title() {
    return this.form.get('title');
  }

  get storeType() {
    return this.form.get('storeConfig').get('storeType');
  }
}
