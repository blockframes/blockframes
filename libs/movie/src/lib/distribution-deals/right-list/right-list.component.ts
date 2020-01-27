import { Component, OnInit, ChangeDetectionStrategy, Input, ViewChild } from '@angular/core';
import { DistributionDeal } from '@blockframes/movie/distribution-deals/+state';
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
    this.dataSource = new MatTableDataSource(deals);
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

  /** Returns only eligible territories for a deal. */
  public getDealTerritories(deal: DistributionDeal) {
    const territories = deal.territory;
    const excludedTerritories = deal.territoryExcluded;
    return territories.filter(territory => !excludedTerritories.includes(territory));
  }
}
