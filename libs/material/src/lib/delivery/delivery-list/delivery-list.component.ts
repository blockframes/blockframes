import { ChangeDetectionStrategy, Component, OnInit  } from '@angular/core';
import { Location } from '@angular/common';
import { MatDialog } from '@angular/material';
import { Observable } from 'rxjs';
import { Delivery } from '../+state/delivery.model';
import { Movie } from 'libs/movie/src/lib/movie/+state/movie.model';
import { MovieQuery } from 'libs/movie/src/lib/movie/+state/movie.query';
import { TemplatePickerComponent } from '../../template/template-picker/template-picker.component';
import { DeliveryQuery } from '../+state';

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
  public displayedColumns: string[] = ['view', 'form', 'stakeholder1', 'stakeholder2', 'status'];

  constructor(
    private movieQuery: MovieQuery,
    private query: DeliveryQuery,
    private location: Location,
    private dialog: MatDialog,
  ) { }

  ngOnInit() {
    this.movie$ = this.movieQuery.selectActive();
    this.deliveries$ = this.query.deliveriesByActiveMovie$;
  }

  public openDialog() {
    this.dialog.open(TemplatePickerComponent, {width: "80%", height: "80%"});
  }

  public goBack() {
    this.location.back();
  }

}
