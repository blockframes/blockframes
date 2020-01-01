import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MovieForm } from '@blockframes/movie/movie/form/movie.form';
@Component({
  selector: 'movie-synopsis-keyassets',
  templateUrl: './synopsis-keyassets.component.html',
  styleUrls: ['./synopsis-keyassets.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieFormSynopsisKeyAssetsComponent {

  constructor(private form: MovieForm) {}

  get synopsis() {
    return this.form.get('story').get('synopsis');
  }

  get keyAssets() {
    return this.form.get('promotionalDescription').get('keyAssets');
  }
}
