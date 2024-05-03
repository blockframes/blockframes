
import { BehaviorSubject, Observable, map, of, startWith, switchMap, tap } from 'rxjs';
import { Component, ChangeDetectionStrategy, ViewChild, Input, ChangeDetectorRef, Output, EventEmitter, Pipe, PipeTransform } from '@angular/core';

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
  Organization,
  Right,
  WaterfallFile
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

  public rights$ = this.shell.rightholderRights$;

  private contracts: Partial<Record<RightholderRole, WaterfallContract[]>>;
  private removeFileOnSave = false;
  private terms: Term[] = [];

  @Input() contractForm: WaterfallContractForm;
  @Output() redirectToBuilder = new EventEmitter<void>();
  public toggleTermsControl = new FormControl(true);
  public currentOrgId = this.orgService.org.id;
  public computing$ = new BehaviorSubject<boolean>(false);

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
    this.terms = [];
    this.uploaderService.clearQueue();
    this.contractForm.reset({ id: this.documentService.createId() });
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

    const signatureDate = this.contractForm.controls.signatureDate.value;
    const existingDoc = documents.find(d => d.id === this.contractForm.controls.id.value);
    const price = this.contractForm.controls.price.value.filter(p => p.value > 0).map(p => ({
      ...p,
      date: p.date || signatureDate
    }));

    const document = createWaterfallDocument<WaterfallContract>({
      id: this.contractForm.controls.id.value,
      name: this.contractForm.controls.name.value,
      type: 'contract',
      waterfallId,
      signatureDate,
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
        price,
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

  delete(contractId: string, _rights: Right[]) {
    if (this.cardModal.isOpened) this.cardModal.close();
    const rights = _rights.filter(r => r.contractId === contractId);
    if (rights.length === 0) {
      this.dialog.open(ConfirmComponent, {
        data: createModalData({
          title: 'Are you sure to delete this Contract?',
          question: 'Pay attention, if you delete the following Contract, you might loose some information.',
          confirm: 'Yes, delete Contract',
          onConfirm: async () => {
            await this.documentService.remove(contractId, { params: { waterfallId: this.shell.waterfall.id } });
            this.snackBar.open('Contract deleted', 'close', { duration: 3000 });
          },
        })
      });
    } else {
      this.dialog.open(ConfirmComponent, {
        data: createModalData({
          title: 'Sorry, unable to delete Contract right now.',
          question: 'This Contract cannot be deleted immediately due to it\'s integration with your Waterfall. Deleting a Contract could potentially disrupt the Waterfall\'s structure.',
          advice: 'If you still wish to proceed with the deletion, please ensure that all relevant rights are removed using the Waterfall Builder feature before deleting the contract.',
          intercom: 'Contact us for more information',
          confirm: 'Go to Waterfall Builder & Delete Rights',
          additionalData: rights.map(r => r.name),
          onConfirm: () => this.redirectToBuilder.emit(),
        })
      });
    }

  }

  /**
   * Checks if there is already a file linked to document or if there is a pending upload
   */
  canUseAI() {
    if (!this.shell.canBypassRules) return false;
    const formValue = this.contractForm.value;
    if (formValue.file?.storagePath) return true;
    const pendingUpload = this.uploaderService.retrieveFromQueue(`waterfall/${this.shell.waterfall.id}/documents`);
    const docId = formValue.id;
    return docId && pendingUpload?.metadata?.id === docId;
  }

  public async askAI() {
    this.computing$.next(true);
    const params = { waterfallId: this.shell.waterfall.id };
    const docId = this.contractForm.controls.id.value;

    let file = this.shell.waterfall.documents.find(d => d.id === docId);

    if (!file?.storagePath) {
      // Create a document if it doesn't exist
      const existingDoc = await this.documentService.getValue(docId, params);
      if (!existingDoc?.id) {
        const doc = createWaterfallDocument<WaterfallContract>({
          id: docId,
          type: 'contract',
          meta: createWaterfallContract({ type: this.selected, name: 'default name' }),
        });
        await this.documentService.upsert<WaterfallDocument>(doc, { params });
      }

      // Upload file and wait for it to be ready
      const pendingUpload = this.uploaderService.retrieveFromQueue(`waterfall/${this.shell.waterfall.id}/documents`);
      if (pendingUpload.metadata?.id === docId) {
        this.uploaderService.upload();
        file = await this.isFileReady(docId);
        this.contractForm.controls.file.patchValue(file);
      }
    }

    const defaultErrorMessage = 'Something went wrong. Please try again later.';
    try {
      const output = await this.documentService.askContractData({
        file,
        type: this.selected,
        rightholders: this.shell.waterfall.rightholders,
        movie: this.shell.movie
      });

      console.log(output);

      if (output.status) {
        const data = output.data;
        if (data.name) {
          this.contractForm.controls.name.patchValue(data.name);
        }
        if (data.licensor.name) {
          this.contractForm.controls.licensorName.patchValue(data.licensor.name);
        }
        if (data.licensee.name) {
          this.contractForm.controls.licenseeName.patchValue(data.licensee.name);
        }
        if (data.signatureTimestamp) {
          this.contractForm.controls.signatureDate.patchValue(new Date(data.signatureTimestamp));

          if (data.startDateTimestamp && data.startDateTimestamp >= data.signatureTimestamp) {
            this.contractForm.controls.startDate.patchValue(new Date(data.startDateTimestamp));

            if (data.endDateTimestamp && data.endDateTimestamp >= data.startDateTimestamp) {
              this.contractForm.controls.endDate.patchValue(new Date(data.endDateTimestamp));
            }
          }
        }
        this.contractForm.markAsDirty();
      } else if (output.error) {
        this.snackBar.open(`Something went wrong: ${output.error}`, 'close', { duration: 3000 });
      } else {
        this.snackBar.open(defaultErrorMessage, 'close', { duration: 3000 });
      }
    } catch (error) {
      this.snackBar.open(defaultErrorMessage, 'close', { duration: 3000 });
    }
    this.computing$.next(false);
  }

  private isFileReady(docId: string) {
    return new Promise<WaterfallFile>((resolve) => {
      const sub = this.shell.waterfall$.subscribe(async waterfall => {
        const doc = waterfall.documents.find(d => d.id === docId);
        if (doc?.storagePath) {
          sub.unsubscribe();
          resolve(doc);
        }
      });
    });
  }
}


