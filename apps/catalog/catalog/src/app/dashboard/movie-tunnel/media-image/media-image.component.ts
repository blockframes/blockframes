import { Component } from '@angular/core';
import { MovieForm } from '@blockframes/movie/movie/form/movie.form';
@Component({
  selector: 'catalog-tunnel-media-image',
  templateUrl: './media-image.component.html',
  styleUrls: ['./media-image.component.scss']
})
export class MediaImageComponent {
  
  constructor(private form: MovieForm) { }

  get type() {
    return this.form.get('promotionalElements')
  }

  get images() {
    return this.form.get('promotionalElements').get('images');
  }

  get poster() {
    return this.form.get('main').get('poster');
  }

  click(e) {
    console.log(e)
  }

  
}
