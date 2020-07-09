import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ImgRef } from "@blockframes/media/+state/media.firestore";
import { MovieQuery } from '@blockframes/movie/+state/movie.query';
import { MovieTunnelComponent } from '../movie-tunnel.component';
@Component({
  selector: 'festival-movie-tunnel-media-file',
  templateUrl: './media-file.component.html',
  styleUrls: ['./media-file.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MediaFileComponent {
  form = this.tunnel.form;

  constructor(private tunnel: MovieTunnelComponent, private movieQuery: MovieQuery) { }

  public movie = this.movieQuery.getActive();
  public presentationPath = `movies/${this.movie.id}/promotionalElements.presentation_deck.media`;
  public scenarioPath = `movies/${this.movie.id}/promotionalElements.scenario.media`;

  get promotionalElements() {
    return this.form.get('promotionalElements');
  }

  // get the ImgRef generated from firestorage and update url of media for each path
  importPDF(imgRef: ImgRef, path: 'scenario' | 'presentation_deck') {
    this.form.get('promotionalElements').get(path).get('media').patchValue(imgRef);
  }
}
