import { Component, ChangeDetectionStrategy, Input, ViewChild, OnInit } from '@angular/core';
import { DistributionDeal, getDealTerritories } from '../../+state';

import { MatSort } from '@angular/material/sort';
import { MediasSlug } from '@blockframes/utils/static-model';
import { formatDate } from '@angular/common';
import { toDate } from '@blockframes/utils/helpers';

const columns = {
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
}

/** Flattened data of version to pass in bf-table-filer. */
interface RightView {
  territory: string[];
  startDate: string;
  endDate: string;
  rights: MediasSlug[];
  languages: string;
  holdback: string;
  firstBroadcastDate: string;
  exclusive: string;
  multidiffusion: string;
  catchUp: string;
}

/** Factory function to create RightView. */
function createRightView(deal: DistributionDeal): RightView {
  if (deal) {
    return {
      territory: getDealTerritories(deal),
      startDate: formatDate(toDate(deal.terms.start), 'MM/dd/yyyy', 'en-US'),
      endDate: formatDate(toDate(deal.terms.end), 'MM/dd/yyyy', 'en-US'),
      rights: deal.licenseType,
      languages: '',
      holdback: '',
      firstBroadcastDate: deal.multidiffusion.length ? formatDate(deal.multidiffusion[0].start, 'MM/dd/yyyy', 'en-US') : '',
      exclusive: deal.exclusive ? 'Yes' : 'No',
      multidiffusion: deal.multidiffusion.length ? deal.multidiffusion.length.toString() : '',
      catchUp: deal.catchUp.start ? formatDate(deal.catchUp.start, 'MM/dd/yyyy', 'en-US') : ''
    };
  }
}

@Component({
  selector: 'catalog-right-list',
  templateUrl: './right-list.component.html',
  styleUrls: ['./right-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RightListComponent implements OnInit {
  @Input() rights: DistributionDeal[]

  public rightViews: RightView[];
  public columns = columns;
  public initialColumns = [
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

  @ViewChild(MatSort) sort: MatSort;

  ngOnInit() {
    this.rightViews = this.rights.map(right => createRightView(right));
  }
}
