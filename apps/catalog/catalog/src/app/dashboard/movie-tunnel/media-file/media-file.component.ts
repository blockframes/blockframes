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

  // get the url generated from firestorage and update url of media for each path
  importPDF(url: string, path: 'scenario' | 'presentation_deck') {
    const imgRefurl = createImgRef(url);
    this.form.get('promotionalElements').get(path).get('media').patchValue(imgRefurl);
  }
}
