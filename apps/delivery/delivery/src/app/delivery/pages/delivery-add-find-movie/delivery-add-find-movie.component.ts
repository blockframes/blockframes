import { ChangeDetectionStrategy, Component, OnInit, HostBinding } from '@angular/core';
import { DeliveryStore } from '../../+state';

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
  @HostBinding('attr.page-id') pageId = 'movie-picker';

  constructor(
    private store: DeliveryStore
  ) {}

  ngOnInit(): void {
    this.store.resetWizard();
  }
}
