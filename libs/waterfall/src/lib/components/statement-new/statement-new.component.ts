import { Component, ChangeDetectionStrategy, Inject, OnInit, OnDestroy, ChangeDetectorRef, Optional } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
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
import { Intercom } from 'ng-intercom';
import { Subscription } from 'rxjs';

export interface StatementNewData {
  type: StatementType;
  currentRightholder: WaterfallRightholder;
  canBypassRules: boolean;
  producer: WaterfallRightholder;
  waterfall: Waterfall,
  contracts: WaterfallContract[],
  date: Date,
  statements: Statement[], // All statements
  rights: Right[],
  onConfirm: (rightholderId: string, contractId: string) => void
}

/**
 * Returnt true if there already are statements for the given type, rightholder and contract
 * @param type 
 * @param rightholderId 
 * @param contractId 
 * @param statements 
 * @returns 
 */
function statementsExists(type: StatementType, rightholderId: string, contractId: string, statements: Statement[]) {
  const rightholderKey = type === 'producer' ? 'receiverId' : 'senderId';
  return statements.some(stm => stm[rightholderKey] === rightholderId && stm.contractId === contractId);
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
    private router: Router,
    @Optional() private intercom: Intercom,
  ) { }

  public ngOnInit() {
    this.rightholders = this.data.waterfall.rightholders
      .filter(r => r.id !== this.data.producer.id)
      .filter(r => r.roles.some(role => statementsRolesMapping[this.data.type].includes(role)))
      .filter(r => {
        const contracts = getContractsWith([this.data.producer.id, r.id], this.data.contracts, this.data.date)
          .filter(c => statementsRolesMapping[this.data.type].includes(c.type));
        if (!contracts.length) return false;
        // If there is at least one contract that does not have statement, we display rightholder
        return contracts.some(c => !statementsExists(this.data.type, r.id, c.id, this.data.statements))
      })
      .filter(r => this.data.canBypassRules || r.id === this.data.currentRightholder.id);

    this.sub = this.rightholderControl.valueChanges.subscribe(rightholderId => {
      this.rightholderContracts = getContractsWith([this.data.producer.id, rightholderId], this.data.contracts, this.data.date)
        .filter(c => statementsRolesMapping[this.data.type].includes(c.type))
        .filter(c => !statementsExists(this.data.type, rightholderId, c.id, this.data.statements))
        .filter(c => this.data.rights.some(r => r.contractId === c.id));

      if (!this.rightholderContracts.length) {
        this.snackbar.open('Could not find any contract with associated rights.', 'WATERFALL MANAGEMENT', { duration: 5000 })
          .onAction()
          .subscribe(() => {
            this.dialogRef.close(false);
            this.router.navigate(['c/o/dashboard/title', this.data.waterfall.id, 'init'])
          });
      }

      this.contractControl.setValue(this.rightholderContracts[0]?.id);
      this.cdr.markForCheck();
    });

    const defaultRightholder = this.rightholders.find(r => r.id === this.data.currentRightholder.id) || this.rightholders[0];
    this.rightholderControl.setValue(defaultRightholder.id);
    if (!this.data.canBypassRules && this.rightholders.length === 1) this.rightholderControl.disable();
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

  public openIntercom() {
    return this.intercom.show('I cannot find my contract when creating a new statement');
  }
}
