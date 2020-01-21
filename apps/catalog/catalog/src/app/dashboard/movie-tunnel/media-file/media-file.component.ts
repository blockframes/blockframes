import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MovieForm } from '@blockframes/movie/movie/form/movie.form';
import { createImgRef } from "@blockframes/utils/image-uploader";
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

  importPDF(file, path: 'scenario' | 'presentation_deck') {
    const url = createImgRef(file)
    this.form.get('promotionalElements').get(path).get('media').patchValue(url);
  }
}
