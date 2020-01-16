import { Component } from '@angular/core';
import { MovieForm } from '@blockframes/movie/movie/form/movie.form';
@Component({
  selector: 'catalog-tunnel-media-image',
  templateUrl: './media-image.component.html',
  styleUrls: ['./media-image.component.scss']
})
export class MediaImageComponent {
  
  constructor(private form: MovieForm) { }

  get promotionalElements() {
    return this.form.get('promotionalElements')
  }
  
  get banner() {
    return this.promotionalElements.get('banner');
  }

  get poster() {
    return this.promotionalElements.get('poster');
  }

  get stillPhoto() {
    return this.promotionalElements.get('still_photo');
  }

}
