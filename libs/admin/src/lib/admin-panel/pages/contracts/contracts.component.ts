import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { getValue } from '@blockframes/utils/helpers';
import { ActivatedRoute } from '@angular/router';
import { ContractService } from '@blockframes/contract/contract/+state/contract.service';
import { Contract } from '@blockframes/contract/contract/+state/contract.model';

@Component({
  selector: 'admin-contracts',
  templateUrl: './contracts.component.html',
  styleUrls: ['./contracts.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContractsComponent implements OnInit {
  public versionColumns = {
    'id': 'Id',
    'type': 'Type',
    'lastVersion.id': 'Version',
    'lastVersion.status': 'Status',
    'lastVersion.scope': 'Scope',
    'partyIds': 'Parties',
    'titleIds': 'Titles',
    'edit': 'Edit',
  };

  public initialColumns: string[] = [
    'id',
    'type',
    'lastVersion.id',
    'lastVersion.status',
    'lastVersion.scope',
    'partyIds',
    'titleIds',
    'edit',
  ];
  public rows: Contract[] = [];
  public movieId = '';
  constructor(
    private contractService: ContractService,
    private route: ActivatedRoute,
    private cdRef: ChangeDetectorRef,
  ) { }

  async ngOnInit() {

    this.movieId = this.route.snapshot.paramMap.get('movieId');
    let contracts: Contract[] = [];
    if (this.movieId) {
      contracts = await this.contractService.getMovieContracts(this.movieId);
    } else {
      contracts = await this.contractService.getValue();
    }

    const promises = contracts.map(async contract => {
      const row = { ...contract } as any;
      // Append new data for table display
      row.edit = {
        id: row.id,
        link: `/c/o/admin/panel/contract/${row.id}`,
      }
      return row;
    });

    this.rows = await Promise.all(promises);
    this.cdRef.markForCheck();
  }

  public filterPredicate(data: any, filter: string) {
    const columnsToFilter = [
      'id',
      'type',
      'lastVersion.id',
      'lastVersion.status',
    ];
    const dataStr = columnsToFilter.map(c => getValue(data, c)).join();
    return dataStr.toLowerCase().indexOf(filter) !== -1;
  }
}
