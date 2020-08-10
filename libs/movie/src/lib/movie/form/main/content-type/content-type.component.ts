import { storeType, contentType } from '@blockframes/movie/+state/movie.firestore';
import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { default as staticModels } from '@blockframes/utils/static-model/staticModels';


@Component({
  selector: '[form] movie-form-content-type',
  templateUrl: './content-type.component.html',
  styleUrls: ['./content-type.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContentTypeComponent {
  public staticModels = staticModels;
  public freshness = storeType;
  public contentType = contentType;

  @Input() form;

  get title() {
    return this.form.get('title');
  }

  get storeType() {
    return this.form.get('storeConfig').get('storeType');
  }
}
