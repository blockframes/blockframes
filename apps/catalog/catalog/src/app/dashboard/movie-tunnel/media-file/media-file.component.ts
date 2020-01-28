import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MovieForm } from '@blockframes/movie/movie/form/movie.form';
import { createImgRef } from "@blockframes/utils/image-uploader";
import { MovieQuery } from '@blockframes/movie/movie+state/movie.query';
@Component({
  selector: 'catalog-movie-tunnel-media-file',
  templateUrl: './media-file.component.html',
  styleUrls: ['./media-file.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MediaFileComponent {

  constructor(
    private form: MovieForm,
    private movieQuery: MovieQuery
    ) {}

  public movie = this.movieQuery.getActive();
  public presentationPath = `movie/${this.movie.id}/PresentationDeck`;
  public scenarioPath = `movie${this.movie.id}/Scenario`;

  get promotionalElements() {
    return this.form.get('promotionalElements');
  }

  // get the url generated from firestorage and update url of media for each path
  importPDF(url: string, path: 'scenario' | 'presentation_deck') {
    const imgRefurl = createImgRef(url);
    this.form.get('promotionalElements').get(path).get('media').patchValue(imgRefurl);
  }
}
