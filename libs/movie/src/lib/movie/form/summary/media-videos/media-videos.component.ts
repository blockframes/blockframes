import { Component, Input } from '@angular/core';
import { MovieForm } from '@blockframes/movie/form/movie.form';

@Component({
  selector: '[movie][link] movie-summary-media-videos',
  templateUrl: './media-videos.component.html',
  styleUrls: ['./media-videos.component.scss']
})
export class SummaryMediaVideosComponent {

  @Input() movie: MovieForm;
  @Input() link: string;
  
}
