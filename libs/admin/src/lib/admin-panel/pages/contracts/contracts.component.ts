import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { getValue } from '@blockframes/utils/helpers';
import { ActivatedRoute } from '@angular/router';
import { ContractService } from '@blockframes/contract/contract/+state/contract.service';
import { ContractWithLastVersion, Contract } from '@blockframes/contract/contract/+state/contract.model';

@Component({
  selector: 'admin-contracts',
  templateUrl: './contracts.component.html',
  styleUrls: ['./contracts.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContractsComponent implements OnInit {
  public versionColumns = {
    'doc.id': 'Id',
    'doc.type': 'Type',
    'last.id': 'Version',
    'last.status': 'Status',
    'doc.parentContractIds': 'Parent Ids',
    'doc.childContractIds': 'Child Ids',
    'last.scope': 'Scope',
    'doc.partyIds': 'Parties',
    'doc.titleIds': 'Titles',
    'edit': 'Edit',
  };

  public initialColumns: string[] = [
    'doc.id',
    'doc.type',
    'last.id',
    'last.status',
    'doc.parentContractIds',
    'doc.childContractIds',
    'last.scope',
    'doc.partyIds',
    'doc.titleIds',
    'edit',
  ];
  public rows: ContractWithLastVersion[] = [];
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
      contracts = await this.contractService.getAllContracts();
    }

    const promises = contracts.map(async contract => {
      const contractWithLastVersion = await this.contractService.getContractWithLastVersion(contract.id);
      const row = { ...contractWithLastVersion } as any;

      // Append new data for table display
      row.edit = {
        id: contractWithLastVersion.doc.id,
        link: `/c/o/admin/panel/contract/${contractWithLastVersion.doc.id}`,
      }
      return row;
    });

    this.rows = await Promise.all(promises);
    this.cdRef.markForCheck();
  }

  public filterPredicate(data: any, filter: string) {
    const columnsToFilter = [
      'doc.id',
      'doc.type',
      'last.id',
      'last.status',
      'doc.parentContractIds',
      'doc.childContractIds'
    ];
    const dataStr = columnsToFilter.map(c => getValue(data, c)).join();
    return dataStr.toLowerCase().indexOf(filter) !== -1;
  }
}
