import { Component, ChangeDetectionStrategy, Inject, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  Right,
  Statement,
  StatementType,
  Waterfall,
  WaterfallContract,
  WaterfallRightholder,
  getContractsWith,
  statementsRolesMapping
} from '@blockframes/model';
import { Subscription } from 'rxjs';

interface StatementNewData {
  type: StatementType;
  producer: WaterfallRightholder;
  waterfall: Waterfall,
  contracts: WaterfallContract[],
  date: Date,
  statements: Statement[],
  rights: Right[],
  onConfirm: (rightholderId: string, contractId: string) => void
}

@Component({
  selector: 'waterfall-statement-new',
  templateUrl: './statement-new.component.html',
  styleUrls: ['./statement-new.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatementNewComponent implements OnInit, OnDestroy {

  public rightholders: WaterfallRightholder[] = [];
  public rightholderControl = new FormControl<string>('');
  public contractControl = new FormControl<string>('');
  public rightholderContracts: WaterfallContract[] = [];
  private sub: Subscription;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: StatementNewData,
    public dialogRef: MatDialogRef<StatementNewComponent>,
    private cdr: ChangeDetectorRef,
    private snackbar: MatSnackBar,
  ) { }

  public ngOnInit() {
    const rightholderKey = this.data.type === 'producer' ? 'receiverId' : 'senderId';
    this.rightholders = this.data.waterfall.rightholders
      .filter(r => r.id !== this.data.producer.id)
      .filter(r => r.roles.some(role => statementsRolesMapping[this.data.type].includes(role)))
      .filter(r => {
        const contracts = getContractsWith([this.data.producer.id, r.id], this.data.contracts, this.data.date)
          .filter(c => statementsRolesMapping[this.data.type].includes(c.type));
        if (!contracts.length) return false;
        // If there is at least one contract that does not have statement, we display rightholder
        return contracts.some(c => !this.data.statements.some(stm => stm[rightholderKey] === r.id && c.id === stm.contractId))
      });

    this.sub = this.rightholderControl.valueChanges.subscribe(value => {
      this.rightholderContracts = getContractsWith([this.data.producer.id, value], this.data.contracts, this.data.date)
        .filter(c => statementsRolesMapping[this.data.type].includes(c.type))
        .filter(c => !this.data.statements.some(stm => stm[rightholderKey] === value && c.id === stm.contractId))
        .filter(c => this.data.rights.some(r => r.contractId === c.id));

      if (!this.rightholderContracts.length) {
        this.snackbar.open('Could not find any contract with associated rights.', 'close', { duration: 5000 });
      }

      this.contractControl.setValue('');
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  public confirm() {
    this.data.onConfirm(this.rightholderControl.value, this.contractControl.value);
    this.dialogRef.close(true);
  }

  public close() {
    this.dialogRef.close(false);
  }
}
