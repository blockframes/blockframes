import { Component, ChangeDetectionStrategy, Input, ViewChild, OnInit } from '@angular/core';
import { DistributionRight, getRightTerritories } from '../../+state';
import { MatSort } from '@angular/material/sort';
import { MediasValues } from '@blockframes/utils/static-model';
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
  rights: MediasValues[];
  languages: string;
  holdback: string;
  firstBroadcastDate: string;
  exclusive: string;
  multidiffusion: string;
  catchUp: string;
}

/** Factory function to create RightView. */
function createRightView(right: DistributionRight): RightView {
  if (right) {
    return {
      territory: getRightTerritories(right),
      startDate: formatDate(toDate(right.terms.start), 'MM/dd/yyyy', 'en-US'),
      endDate: formatDate(toDate(right.terms.end), 'MM/dd/yyyy', 'en-US'),
      rights: right.licenseType,
      languages: '',
      holdback: '',
      firstBroadcastDate: right.multidiffusion.length ? formatDate(right.multidiffusion[0].start, 'MM/dd/yyyy', 'en-US') : '',
      exclusive: right.exclusive ? 'Yes' : 'No',
      multidiffusion: right.multidiffusion.length ? right.multidiffusion.length.toString() : '',
      catchUp: right.catchUp.start ? formatDate(right.catchUp.start, 'MM/dd/yyyy', 'en-US') : ''
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
  @Input() rights: DistributionRight[]

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
