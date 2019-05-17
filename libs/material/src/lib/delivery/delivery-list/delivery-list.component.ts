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
  public deliveries$: Observable<Delivery[]>;
  public hasDeliveries$: Observable<boolean>;
  private isAlive = true;

  constructor(
    private movieQuery: MovieQuery,
    private service: DeliveryService,
    private router: Router,
    private dialog: MatDialog,
    private stakeholderService: StakeholderService,
    private query: DeliveryQuery,
  ) {}

  ngOnInit() {
    this.hasDeliveries$ = this.query.hasDeliveries$;
    this.movie$ = this.movieQuery.selectActive();
    this.deliveries$ = this.query.selectAll();
    this.stakeholderService.subscribeOnStakeholdersByActiveMovie$().pipe(takeWhile(() => this.isAlive)).subscribe();
  }

  public async selectDelivery(delivery: Delivery, movieId: string) {
    const validated = await this.service.isDeliveryValidated(delivery.id);
    validated
      ? this.router.navigate([`layout/${movieId}/${delivery.id}/view`])
      : this.router.navigate([`layout/${movieId}/${delivery.id}/edit`]);
  }

  public openDialog() {
    this.dialog.open(TemplatePickerComponent, { width: '50%' });
  }

  ngOnDestroy() {
    this.isAlive = false;
  }
}
