import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { MatDialog } from '@angular/material';
import { Observable } from 'rxjs';
import { Delivery } from '../+state/delivery.model';
import { Movie } from 'libs/movie/src/lib/movie/+state/movie.model';
import { MovieQuery } from 'libs/movie/src/lib/movie/+state/movie.query';
import { TemplatePickerComponent } from '../../template/template-picker/template-picker.component';
import { DeliveryQuery, DeliveryStore, DeliveryService } from '../+state';
import { Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/firestore';

@Component({
  selector: 'delivery-list',
  templateUrl: './delivery-list.component.html',
  styleUrls: ['./delivery-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeliveryListComponent implements OnInit {
  public movie$: Observable<Movie>;
  public deliveries$: Observable<Delivery[]>;

  // Material table
  public displayedColumns: string[] = ['id', 'stakeholder1', 'stakeholder2', 'status'];

  constructor(
    private movieQuery: MovieQuery,
    private query: DeliveryQuery,
    private store: DeliveryStore,
    private service: DeliveryService,
    private router: Router,
    private location: Location,
    private dialog: MatDialog,
    private db: AngularFirestore
  ) {}

  ngOnInit() {
    this.movie$ = this.movieQuery.selectActive();
    this.deliveries$ = this.query.deliveriesByActiveMovie$;
  }

  public selectDelivery(delivery: Delivery, movieId: string) {
    this.store.setActive(delivery.id);
    this.service.isDeliveryValidated()
      ? this.router.navigate([`layout/${movieId}/view/${delivery.id}`])
      : this.router.navigate([`layout/${movieId}/form/${delivery.id}`]);
  }

  public openDialog() {
    this.dialog.open(TemplatePickerComponent, { width: '80%' });
  }

  public goBack() {
    this.location.back();
  }
}
