import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';

/**
 * Page for the flow: "create a delivery"
 * first step, find the movie.
 */
@Component({
  selector: 'delivery-add-find-movie',
  templateUrl: './delivery-add-find-movie.component.html',
  styleUrls: ['./delivery-add-find-movie.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeliveryAddFindMovieComponent {
  constructor(private router: Router) {}

  public async selectMovie(movieId: string): Promise<boolean> {
    return this.router.navigate([`/layout/o/delivery/add/${movieId}/2-choose-starter`]);
  }
}
