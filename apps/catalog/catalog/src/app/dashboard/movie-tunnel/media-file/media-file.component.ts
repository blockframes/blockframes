import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MovieForm } from '@blockframes/movie/movie/form/movie.form';

@Component({
  selector: 'catalog-movie-tunnel-media-file',
  templateUrl: './media-file.component.html',
  styleUrls: ['./media-file.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MediaFileComponent {

  constructor(private form: MovieForm) { }

  get promotionalElements() {
    return this.form.get('promotionalElements');
  }

  importPDF(bytes: Uint8Array) {
    console.log(bytes)
   console.log(this.form.get('promotionalElements'))
  }
}
