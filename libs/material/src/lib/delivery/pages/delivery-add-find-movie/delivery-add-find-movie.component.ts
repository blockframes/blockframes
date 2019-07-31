import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

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

  constructor() {
  }

  ngOnInit() {
  }
}
