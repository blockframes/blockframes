import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DeliveryStore } from '../../+state';
import { MovieQuery } from '@blockframes/movie';

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
export class DeliveryAddFindMovieComponent implements OnInit {
  constructor(
    private router: Router,
    private store: DeliveryStore,
    private query: MovieQuery
  ) {}

  ngOnInit(): void {
    this.store.resetWizard();
  }
}
