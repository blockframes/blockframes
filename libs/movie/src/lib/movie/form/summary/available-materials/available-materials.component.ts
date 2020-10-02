import { Component, Input } from '@angular/core';
import { MovieForm } from '@blockframes/movie/form/movie.form';

@Component({
  selector: '[movie][link] movie-summary-available-materials',
  templateUrl: './available-materials.component.html',
  styleUrls: ['./available-materials.component.scss']
})
export class SummaryAvailableMaterialsComponent {

  @Input() movie: MovieForm;
  @Input() link: string;

}
