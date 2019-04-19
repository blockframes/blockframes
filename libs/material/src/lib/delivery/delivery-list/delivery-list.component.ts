import { ChangeDetectionStrategy, Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Observable } from 'rxjs';
import { Delivery } from '../+state/delivery.model';
import { Movie } from 'libs/movie/src/lib/movie/+state/movie.model';
import { MovieQuery } from 'libs/movie/src/lib/movie/+state/movie.query';
import { TemplatePickerComponent } from '../../template/template-picker/template-picker.component';
import { DeliveryStore, DeliveryService, DeliveryQuery } from '../+state';
import { Router } from '@angular/router';
import { StakeholderService } from '@blockframes/movie';
import { takeWhile } from 'rxjs/operators';

@Component({
  selector: 'delivery-list',
  templateUrl: './delivery-list.component.html',
  styleUrls: ['./delivery-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeliveryListComponent implements OnInit, OnDestroy {
  public movie$: Observable<Movie>;
  public deliveries$: Observable<Delivery>;
  private isAlive = true;

  constructor(
    private movieQuery: MovieQuery,
    private store: DeliveryStore,
    private service: DeliveryService,
    private router: Router,
    private dialog: MatDialog,
    private stakeholderService: StakeholderService,
  ) {}

  ngOnInit() {
    this.movie$ = this.movieQuery.selectActive();
    this.deliveries$ = this.service.deliveryList;
    this.stakeholderService.subscribeOnStakeholdersByActiveMovie$().pipe(takeWhile(() => this.isAlive)).subscribe();
  }

  public async selectDelivery(delivery: Delivery, movieId: string) {
    this.store.setActive(delivery.id);
    const validated = await this.service.isDeliveryValidated();
    validated
      ? this.router.navigate([`layout/${movieId}/view/${delivery.id}`])
      : this.router.navigate([`layout/${movieId}/form/${delivery.id}`]);
  }

  public openDialog() {
    this.dialog.open(TemplatePickerComponent, { width: '40%' });
  }

  ngOnDestroy() {
    this.isAlive = false;
  }
}
