import { Component, ChangeDetectionStrategy, Optional } from '@angular/core';
import { Movie } from '@blockframes/movie/+state/movie.model';
import { Intercom } from 'ng-intercom';

@Component({
  selector: 'catalog-negotiation',
  templateUrl: './negotiation.component.html',
  styleUrls: ['./negotiation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NegotiationComponent {
  panelOpenState: boolean;

  constructor(
    @Optional() private intercom: Intercom
  ) { }

  getDirectors(movie: Movie) {
    return movie.directors.map(d => `${d.firstName} ${d.lastName}`).join(', ');
  }

  openIntercom() {
    this.intercom.show();
  }
}
