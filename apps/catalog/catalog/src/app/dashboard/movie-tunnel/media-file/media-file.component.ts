import { Component } from '@angular/core';
import { MovieForm } from '@blockframes/movie/movie/form/movie.form';

@Component({
  selector: 'catalog-movie-tunnel-media-file',
  templateUrl: './media-file.component.html',
  styleUrls: ['./media-file.component.scss']
})
export class MediaFileComponent {

  constructor(private form: MovieForm) { }

  get promotionalElements() {
    return this.form.get('promotionalElements');
  }

}
