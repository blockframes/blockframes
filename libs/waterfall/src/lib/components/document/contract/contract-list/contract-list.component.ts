
import { Observable, map, of, startWith, switchMap, tap } from 'rxjs';
import { Component, ChangeDetectionStrategy, ViewChild, Input, ChangeDetectorRef } from '@angular/core';

import { WaterfallService } from '../../../../waterfall.service';
import { FileUploaderService } from '@blockframes/media/file-uploader.service';
import { WaterfallContractForm } from '../../../../form/contract.form';
import { CardModalComponent } from '@blockframes/ui/card-modal/card-modal.component';
import { WaterfallDocumentsService } from '../../../../documents.service';
import {
  RightholderRole,
  Waterfall,
  WaterfallContract,
  WaterfallDocument,
  createWaterfallContract,
  createWaterfallDocument,
  rightholderRoles,
  createTerm,
  createWaterfallRightholder,
  createExpenseType,
  Term,
  WaterfallPermissions,
  Organization
} from '@blockframes/model';
import { TermService } from '@blockframes/contract/term/service';
import { OrganizationService } from '@blockframes/organization/service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormControl } from '@angular/forms';
import { DashboardWaterfallShellComponent } from '../../../../dashboard/shell/shell.component';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmComponent } from '@blockframes/ui/confirm/confirm.component';
import { createModalData } from '@blockframes/ui/global-modal/global-modal.component';
import { DocumentShareComponent } from '../../document-share/document-share.component';

@Component({
  selector: 'waterfall-contract-list',
  templateUrl: './contract-list.component.html',
  styleUrls: ['./contract-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContractListComponent {

  @ViewChild(CardModalComponent) cardModal: CardModalComponent;

  public selected?: RightholderRole;
  public creating = false;
  public contracts$ = this.shell.rightholderContracts$.pipe(
    startWith([]),
    map(rawContracts => {
      const contracts: Partial<Record<RightholderRole, WaterfallContract[]>> = {};
      Object.keys(rightholderRoles)
        .filter(r => r !== 'producer')
        // Fetch all root contracts for each role
        .forEach((r: RightholderRole) => contracts[r] = rawContracts.filter(c => c.type === r && !c.rootId));
      return contracts;
    }),
    tap(rawContracts => this.contracts = rawContracts)
  );

  private permissions$: Observable<WaterfallPermissions[]> = this.shell.canBypassRules$.pipe(
    switchMap(canBypassRules => canBypassRules ? this.shell.permissions$ : of([])),
  );

  public organizations$ = this.permissions$.pipe(
    switchMap(permissions => this.orgService.valueChanges(permissions.map(p => p.id))),
    map(orgs => orgs.filter(o => o.id !== this.currentOrgId))
  );

  private contracts: Partial<Record<RightholderRole, WaterfallContract[]>>;
  private removeFileOnSave = false;
  private terms: Term[] = [];

  @Input() contractForm: WaterfallContractForm;
  public toggleTermsControl = new FormControl(true);
  public currentOrgId = this.orgService.org.id;

  constructor(
    private waterfallService: WaterfallService,
    private uploaderService: FileUploaderService,
    private documentService: WaterfallDocumentsService,
    private orgService: OrganizationService,
    private termsService: TermService,
    private snackBar: MatSnackBar,
    public shell: DashboardWaterfallShellComponent,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) { }

  select(role: RightholderRole) {
    if (this.contractForm.pristine) return this._select(role);

    const dialogRef = this.dialog.open(ConfirmComponent, {
      data: createModalData({
        title: 'You are about to leave the form',
        question: 'Some changes have not been saved. If you leave now, you might lose these changes',
        cancel: 'Cancel',
        confirm: 'Leave anyway'
      }, 'small'),
      autoFocus: false
    });
    dialogRef.afterClosed().subscribe((leave: boolean) => {
      if (leave) {
        this.contractForm.markAsPristine();
        this._select(role);
      }
    });
  }

  private _select(role: RightholderRole) {
    this.selected = role;
    this.creating = role ? this.contracts[role].length === 0 : false; // if we select an empty role we automatically switch to create mode
    if (this.creating) {
      this.terms = [];
      this.contractForm.reset({ id: this.documentService.createId() });
    }

    this.cdr.markForCheck();
  }

  create() {
    this.creating = true;
    this.terms = [];
    this.contractForm.reset({ id: this.documentService.createId() });
  }

  async edit(contract: WaterfallContract, waterfall: Waterfall) {
    this.terms = await this.termsService.getValue(contract.termIds);
    const licensee = waterfall.rightholders.find(r => r.id === contract.buyerId);
    const licensor = waterfall.rightholders.find(r => r.id === contract.sellerId);
    const file = waterfall.documents.find(f => f.id === contract.id);
    const expenseTypes = waterfall.expenseTypes[contract.id] ?? [];
    this.contractForm.reset({
      id: contract.id,
      name: contract.name,
      licenseeName: licensee?.name,
      licenseeRole: licensee?.roles,
      licensorName: licensor?.name,
      licensorRole: licensor?.roles,
      signatureDate: contract.signatureDate,
      startDate: contract.duration?.from,
      endDate: contract.duration?.to,
      price: contract.price,
      currency: contract.currency,
      terms: this.terms.map(t => createTerm(t)),
      file: file,
      expenseTypes,
    });
    this.creating = true;
  }

  removeFile(bool: boolean) {
    this.removeFileOnSave = bool;
  }

  async save(waterfall: Waterfall, documents: WaterfallDocument[]) {
    if (!this.toggleTermsControl.value && this.terms.length) {
      await this.termsService.remove(this.terms.map(t => t.id));
      this.contractForm.controls.terms.patchAllValue([]);
    }

    if (!this.contractForm.valid) {
      this.snackBar.open('Please fill all required fields.', 'close', { duration: 3000 });
      return;
    }

    const waterfallId = waterfall.id;

    // Seller create/update
    let sellerId: string;
    const { rightholders, expenseTypes } = waterfall;
    const existingSeller = rightholders.find(r => r.name === this.contractForm.controls.licensorName.value);
    if (existingSeller) {
      sellerId = existingSeller.id;
      existingSeller.roles = this.contractForm.controls.licensorRole.value; // update roles
    } else {
      sellerId = this.waterfallService.createId();
      rightholders.push(createWaterfallRightholder({
        id: sellerId,
        name: this.contractForm.controls.licensorName.value,
        roles: this.contractForm.controls.licensorRole.value,
      }));
    }

    // Buyer create/update
    let buyerId: string;
    const existingBuyer = rightholders.find(r => r.name === this.contractForm.controls.licenseeName.value);
    if (existingBuyer) {
      buyerId = existingBuyer.id;
      existingBuyer.roles = this.contractForm.controls.licenseeRole.value; // update roles
    } else {
      buyerId = this.waterfallService.createId();
      rightholders.push(createWaterfallRightholder({
        id: buyerId,
        name: this.contractForm.controls.licenseeName.value,
        roles: this.contractForm.controls.licenseeRole.value,
      }));
    }

    const existingDoc = documents.find(d => d.id === this.contractForm.controls.id.value);
    const document = createWaterfallDocument<WaterfallContract>({
      id: this.contractForm.controls.id.value,
      name: this.contractForm.controls.name.value,
      type: 'contract',
      waterfallId,
      signatureDate: this.contractForm.controls.signatureDate.value,
      ownerId: existingDoc?.ownerId || this.orgService.org.id,
      meta: createWaterfallContract({
        type: this.selected,
        status: 'accepted',
        buyerId, // licensee
        sellerId, // licensor
        duration: {
          from: this.contractForm.controls.startDate.value,
          to: this.contractForm.controls.endDate.value,
        },
        price: this.contractForm.controls.price.value.filter(p => p.value > 0),
        currency: this.contractForm.controls.currency.value,
      }),
    });

    const terms = (this.contractForm.controls.terms.value ?? []).map(term => createTerm({
      ...term,
      id: term.id || this.termsService.createId(),
      contractId: document.id,
      titleId: waterfallId,
      duration: (!term.duration.from || !term.duration.to) ? document.meta.duration : term.duration,
    }));
    document.meta.termIds = terms.map(t => t.id);

    const expenseType = this.contractForm.controls.expenseTypes.value.filter(c => !!c.name).map(c => createExpenseType({
      ...c,
      contractId: document.id,
      id: c.id || this.waterfallService.createId(),
    }));
    expenseTypes[document.id] = expenseType;

    await Promise.all([
      this.waterfallService.update({ id: waterfallId, rightholders, expenseTypes }),
      this.documentService.upsert<WaterfallDocument>(document, { params: { waterfallId } }),
      this.termsService.upsert(terms)
    ]);

    if (this.removeFileOnSave) {
      this.documentService.removeFile({ waterfallId, documentId: document.id });
    } else {
      this.uploaderService.upload();
    }
    this.contractForm.markAsPristine();

    this.snackBar.open('Contract saved', 'close', { duration: 3000 });
  }

  share(documentId: string, waterfallId: string, organizations: Organization[]) {
    this.dialog.open(DocumentShareComponent, {
      data: createModalData({ organizations, documentId, waterfallId }, 'medium'),
      autoFocus: false
    });
  }

  close() {
    if (this.cardModal.isOpened) this.cardModal.close();
    if (this.contractForm.pristine) return this._select(undefined);

    const dialogRef = this.dialog.open(ConfirmComponent, {
      data: createModalData({
        title: 'You are about to leave the form',
        question: 'Some changes have not been saved. If you leave now, you might lose these changes',
        cancel: 'Cancel',
        confirm: 'Leave anyway'
      }, 'small'),
      autoFocus: false
    });
    dialogRef.afterClosed().subscribe((leave: boolean) => {
      if (leave) {
        this.contractForm.markAsPristine();
        this._select(undefined);
      }
    });
  }
}

