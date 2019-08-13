import { ChangeDetectionStrategy, Component, OnInit, Input, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { Movie } from 'libs/movie/src/lib/movie/+state/movie.model';
import { MovieQuery } from 'libs/movie/src/lib/movie/+state/movie.query';
import { DeliveryService, DeliveryQuery, Delivery } from '../../+state';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { AnimationMetadataType } from '@angular/animations';


@Component({
  selector: 'delivery-list',
  templateUrl: './delivery-list.component.html',
  styleUrls: ['./delivery-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeliveryListComponent implements OnInit {

  @ViewChild(MatSort, { static: true }) sort: MatSort;

  public inProgressDataSource: MatTableDataSource<Delivery>;
  public inProgressDisplayedColumns: string[] = ['stakeholders', 'state'];

  public archivedDataSource: MatTableDataSource<Delivery>;
  public archivedDisplayedColumns: string[] = ['stakeholders', 'state'];


  constructor(
    private query: DeliveryQuery,
    private movieQuery: MovieQuery,
    private router: Router,
  ) {}

  ngOnInit() {
    this.inProgressDataSource = new MatTableDataSource(this.query.getAll({filterBy: entity => entity.state === 'pending'}));
    this.archivedDataSource = new MatTableDataSource(this.query.getAll({filterBy: entity => entity.state === 'pending'}));
    this.inProgressDataSource.sort = this.sort;
  }

  public addDelivery() {
    const movieId = this.movieQuery.getActiveId();
    this.router.navigate([`/layout/o/delivery/add/${movieId}/2-choose-starter`]);
  }

}
