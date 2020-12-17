import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { getValue } from '@blockframes/utils/helpers';
import { ActivatedRoute, Router } from '@angular/router';
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
    'id': { value: 'Id', disableSort: true },
    'type': 'Type',
    'lastVersion.id': 'Version',
    'lastVersion.status': 'Status',
    'lastVersion.scope': 'Scope',
    'partyIds': { value: 'Parties', disableSort: true },
    'titleIds': { value: 'Titles', disableSort: true }
  };

  public initialColumns: string[] = [
    'id',
    'type',
    'lastVersion.id',
    'lastVersion.status',
    'lastVersion.scope',
    'partyIds',
    'titleIds',
  ];
  public rows: Contract[] = [];
  public movieId = '';
  constructor(
    private contractService: ContractService,
    private route: ActivatedRoute,
    private router: Router,
    private cdRef: ChangeDetectorRef,
  ) { }

  async ngOnInit() {

    this.movieId = this.route.snapshot.paramMap.get('movieId');
    if (this.movieId) {
      this.rows = await this.contractService.getMovieContracts(this.movieId);
    } else {
      this.rows = await this.contractService.getValue();
    }

    this.cdRef.markForCheck();
  }

  goToEdit(contract: Contract) {
    this.router.navigate([`/c/o/admin/panel/contract/${contract.id}`]);
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
