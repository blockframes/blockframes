// Angular
import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

// Blockframes
import { HostedMediaFormValue } from '@blockframes/media/+state/media.firestore';

import { MovieForm } from '../../../../form/movie.form';

@Component({
  selector: '[form] movie-summary-image',
  templateUrl: './image.component.html',
  styleUrls: ['./image.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieSummaryImageComponent {
  @Input() form: MovieForm;
  @Input() link: string;

  get photoHasNoValue() {
    try {
      const stillPhotos: Record<string, HostedMediaFormValue> = this.form.promotional.get('still_photo').value;
      const keys = Object.keys(stillPhotos);

      // if there is no still photos
      return keys.length === 0 ?
        true :
        // or if at least one still photo as an empty url
        keys.some(key => !stillPhotos[key].ref);

    } catch (error) {
      console.warn(error);
      return true;
    }
  }
}
