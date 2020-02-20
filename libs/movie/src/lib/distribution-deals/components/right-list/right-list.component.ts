import { Component, OnInit, ChangeDetectionStrategy, Input, ViewChild } from '@angular/core';
import { DistributionDeal, getDealTerritories, formatDistributionDeal } from '@blockframes/movie/distribution-deals/+state';
import { MatTableDataSource } from '@angular/material/table';
import { Observable } from 'rxjs';
import { FormControl } from '@angular/forms';
import { MatSort } from '@angular/material/sort';
import { startWith } from 'rxjs/operators';

@Component({
  selector: 'catalog-right-list',
  templateUrl: './right-list.component.html',
  styleUrls: ['./right-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RightListComponent implements OnInit {
  @Input()
  set source(deals: DistributionDeal[]) {
    const formattedDeals = deals.map(deal => formatDistributionDeal(deal));
    this.dataSource = new MatTableDataSource(formattedDeals);
    this.dataSource.sort = this.sort;
  }

  public dealColumns: Record<string, any> = {
    territory: 'Territory',
    startDate: 'Start Date',
    endDate: 'End Date',
    rights: 'Rights',
    languages: 'Languages',
    holdback: 'Holdback',
    firstBroadcastDate: '1st Broadcast Date',
    exclusive: 'Exclusive',
    multidiffusion: 'Multidiffusion',
    catchUp: 'Catch Up'
  };

  public displayedColumns$: Observable<string[]>;
  public dataSource: MatTableDataSource<DistributionDeal>;
  public columnFilter = new FormControl([]);

  public initialDealColumns = [
    'territory',
    'startDate',
    'endDate',
    'rights',
    'languages',
    'holdback',
    'firstBroadcastDate',
    'exclusive',
    'multidiffusion',
    'catchUp'
  ];

  @ViewChild(MatSort, { static: false }) sort: MatSort;

  ngOnInit() {
    this.columnFilter.patchValue(this.initialDealColumns);
    this.displayedColumns$ = this.columnFilter.valueChanges.pipe(
      startWith(this.initialDealColumns)
    );
  }

  public getDealTerritories(deal: DistributionDeal) {
    return getDealTerritories(deal);
  }
}
