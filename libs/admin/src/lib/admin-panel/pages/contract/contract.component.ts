import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material';
import { InvoiceService } from '@blockframes/contract/invoice/+state/invoice.service';
import { Invoice } from '@blockframes/contract/invoice/+state/invoice.firestore';
import { InvoiceAdminForm } from '../../forms/invoice-admin.form';
import { PaymentStatus } from '@blockframes/utils/common-interfaces/price';
import { ContractService } from '@blockframes/contract/contract/+state/contract.service';
import { Contract, ContractWithLastVersion } from '@blockframes/contract/contract/+state/contract.model';
import { ContractAdminForm } from '../../forms/contract-admin.form';
import { ContractVersionAdminForm } from '../../forms/contract-version-admin.form';
import { ContractStatus, ContractType } from '@blockframes/contract/contract/+state/contract.firestore';
import { ContractVersionService } from '@blockframes/contract/version/+state/contract-version.service';
import { cleanModel, getValue } from '@blockframes/utils';
import { ContractVersion } from '@blockframes/contract/version/+state';


@Component({
  selector: 'admin-contract',
  templateUrl: './contract.component.html',
  styleUrls: ['./contract.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContractComponent implements OnInit {
  public contractId = '';
  public contract: ContractWithLastVersion;
  public contractForm: ContractAdminForm;
  public contractVersionForm: ContractVersionAdminForm;
  public statuses: string[];
  public types: string[];
  public version: number;

  public versionColumns = {
    'id': 'Version',
    'status': 'Status',
    'creationDate': 'Creation date',
  };

  public initialColumns: string[] = [
    'id',
    'status',
    'creationDate',
  ];

  public contractVersions: ContractVersion[] = [];

  constructor(
    private contractService: ContractService,
    private contractVersionService: ContractVersionService,
    private route: ActivatedRoute,
    private cdRef: ChangeDetectorRef,
    private snackBar: MatSnackBar
  ) { }

  async ngOnInit() {
    this.contractId = this.route.snapshot.paramMap.get('contractId');
    this.contract = await this.contractService.getContractWithLastVersion(this.contractId);
    this.contractForm = new ContractAdminForm(this.contract.doc);
    this.contractVersionForm = new ContractVersionAdminForm(this.contract.last);
    this.version = parseInt(this.contract.last.id, 10);

    this.contractVersions = await this.contractVersionService.getContractVersions(this.contractId);

    this.statuses = Object.keys(ContractStatus);
    this.types = Object.keys(ContractType);

    this.cdRef.detectChanges();
  }

  public async updateContract() {
    if (this.contractForm.invalid) {
      this.snackBar.open('Information not valid', 'close', { duration: 5000 });
      return;
    }

    const update = {
      type: this.contractForm.get('type').value,
    }

    await this.contractService.update(this.contractId, update);

    this.snackBar.open('Informations updated !', 'close', { duration: 5000 });
  }

  public async updateVersion() {
    if (this.contractVersionForm.invalid) {
      this.snackBar.open('Information not valid', 'close', { duration: 5000 });
      return;
    }

    const update = {
      ...cleanModel(this.contract.last),
      creationDate: Date.now(),
      status: this.contractVersionForm.get('status').value,
    }

    const newVersionId = await this.contractVersionService.addContractVersion({ doc: this.contract.doc, last: update });
    this.version = parseInt(newVersionId, 10);
    this.contractVersions = await this.contractVersionService.getContractVersions(this.contractId);
    this.cdRef.detectChanges();

    this.snackBar.open('Informations updated !', 'close', { duration: 5000 });
  }

  filterPredicate(data: any, filter) {
    const columnsToFilter = [
      'id',
    ];
    const dataStr = columnsToFilter.map(c => getValue(data, c)).join();
    return dataStr.toLowerCase().indexOf(filter) !== -1;
  }
}
