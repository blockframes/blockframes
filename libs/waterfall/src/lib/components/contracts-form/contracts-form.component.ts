
import { map, startWith, tap } from 'rxjs';
import { Component, ChangeDetectionStrategy, ViewChild, Input, Pipe, PipeTransform } from '@angular/core';

import { WaterfallService } from '../../waterfall.service';
import { FileUploaderService } from '@blockframes/media/file-uploader.service';
import { WaterfallDocumentForm } from '../../form/document.form';
import { CardModalComponent } from '@blockframes/ui/card-modal/card-modal.component';
import { WaterfallDocumentsService } from '../../documents.service';
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
  Term
} from '@blockframes/model';
import { TermService } from '@blockframes/contract/term/service';
import { OrganizationService } from '@blockframes/organization/service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormControl } from '@angular/forms';
import { DashboardWaterfallShellComponent } from '../../dashboard/shell/shell.component';

@Component({
  selector: 'waterfall-contracts-form',
  templateUrl: './contracts-form.component.html',
  styleUrls: ['./contracts-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContractsFormComponent {

  @ViewChild(CardModalComponent) cardModal: CardModalComponent;

  public selected?: RightholderRole;
  public creating = false;
  public contracts$ = this.shell.contracts$.pipe(
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

  private contracts: Partial<Record<RightholderRole, WaterfallContract[]>>;
  private removeFileOnSave = false;
  private terms: Term[] = [];

  @Input() documentForm: WaterfallDocumentForm;
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
  ) { }

  select(role: RightholderRole) {
    this.selected = role;
    this.creating = this.contracts[role].length === 0; // if we select an empty role we automatically switch to create mode
    if (this.creating) {
      this.terms = [];
      this.documentForm.reset({ id: this.documentService.createId() });
    }
  }

  create() {
    this.creating = true;
    this.terms = [];
    this.documentForm.reset({ id: this.documentService.createId() });
  }

  async edit(contract: WaterfallContract, waterfall: Waterfall) {
    this.terms = await this.termsService.getValue(contract.termIds);
    const licensee = waterfall.rightholders.find(r => r.id === contract.buyerId);
    const licensor = waterfall.rightholders.find(r => r.id === contract.sellerId);
    const file = waterfall.documents.find(f => f.id === contract.id);
    const expenseTypes = waterfall.expenseTypes[contract.id] ?? [];
    this.documentForm.reset({
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
      this.documentForm.controls.terms.patchAllValue([]);
    }

    if (!this.documentForm.valid) {
      this.snackBar.open('Please fill all required fields.', 'close', { duration: 3000 });
      return;
    }

    const waterfallId = waterfall.id;

    // Seller create/update
    let sellerId: string;
    const { rightholders, expenseTypes } = waterfall;
    const existingSeller = rightholders.find(r => r.name === this.documentForm.controls.licensorName.value);
    if (existingSeller) {
      sellerId = existingSeller.id;
      existingSeller.roles = this.documentForm.controls.licensorRole.value; // update roles
    } else {
      sellerId = this.waterfallService.createId();
      rightholders.push(createWaterfallRightholder({
        id: sellerId,
        name: this.documentForm.controls.licensorName.value,
        roles: this.documentForm.controls.licensorRole.value,
      }));
    }

    // Buyer create/update
    let buyerId: string;
    const existingBuyer = rightholders.find(r => r.name === this.documentForm.controls.licenseeName.value);
    if (existingBuyer) {
      buyerId = existingBuyer.id;
      existingBuyer.roles = this.documentForm.controls.licenseeRole.value; // update roles
    } else {
      buyerId = this.waterfallService.createId();
      rightholders.push(createWaterfallRightholder({
        id: buyerId,
        name: this.documentForm.controls.licenseeName.value,
        roles: this.documentForm.controls.licenseeRole.value,
      }));
    }

    const existingDoc = documents.find(d => d.id === this.documentForm.controls.id.value);
    const document = createWaterfallDocument<WaterfallContract>({
      id: this.documentForm.controls.id.value,
      name: this.documentForm.controls.name.value,
      type: 'contract',
      waterfallId,
      signatureDate: this.documentForm.controls.signatureDate.value,
      ownerId: existingDoc?.ownerId || this.orgService.org.id,
      meta: createWaterfallContract({
        type: this.selected,
        status: 'accepted',
        buyerId, // licensee
        sellerId, // licensor
        duration: {
          from: this.documentForm.controls.startDate.value,
          to: this.documentForm.controls.endDate.value,
        },
        price: this.documentForm.controls.price.value.filter(p => p.value > 0),
        currency: this.documentForm.controls.currency.value,
      }),
    });

    const terms = (this.documentForm.controls.terms.value ?? []).map(term => createTerm({
      ...term,
      id: term.id || this.termsService.createId(),
      contractId: document.id,
      titleId: waterfallId,
      duration: (!term.duration.from || !term.duration.to) ? document.meta.duration : term.duration,
    }));
    document.meta.termIds = terms.map(t => t.id);

    const expenseType = this.documentForm.controls.expenseTypes.value.filter(c => !!c.name).map(c => createExpenseType({
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
    this.documentForm.markAsPristine();

    this.snackBar.open('Contract saved', 'close', { duration: 3000 });
  }
}

@Pipe({ name: 'canEdit' })
export class CanEditPipe implements PipeTransform {
  transform(contract: WaterfallContract, orgId: string, documents: WaterfallDocument[], canBypassRules: boolean) {
    // TODO #9585 only canBypassRules, other cannot create contract
    // TODO #9585 change back to admin/member instead of Editor and Viewer ?
    if (canBypassRules) return true;
    const doc = documents.find(d => d.id === contract.id);
    if (doc.ownerId === orgId) return true;
    return false;
  }
}
