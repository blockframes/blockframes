
import { Observable, map, startWith, tap } from 'rxjs';
import { Component, ChangeDetectionStrategy, ViewChild, Input, OnInit, Pipe, PipeTransform, Output, EventEmitter } from '@angular/core';

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
  WaterfallFile,
  isContract,
  sortContracts,
  convertDocumentTo,
  createExpensesConfig
} from '@blockframes/model';
import { TermService } from '@blockframes/contract/term/service';
import { OrganizationService } from '@blockframes/organization/service';

@Component({
  selector: '[movieId] waterfall-contracts-form',
  templateUrl: './contracts-form.component.html',
  styleUrls: ['./contracts-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContractsFormComponent implements OnInit {

  @ViewChild(CardModalComponent) cardModal: CardModalComponent;

  selected?: RightholderRole;

  creating = false;

  waterfall$: Observable<Waterfall>;
  contracts$: Observable<Partial<Record<RightholderRole, WaterfallContract[]>>>;
  private waterfall: Waterfall;
  private contracts: Partial<Record<RightholderRole, WaterfallContract[]>>;
  private removeFileOnSave = false;

  @Input() movieId: string;
  @Input() documentForm: WaterfallDocumentForm;

  @Output() skip = new EventEmitter();

  constructor(
    private waterfallService: WaterfallService,
    private uploaderService: FileUploaderService,
    private documentService: WaterfallDocumentsService,
    private orgService: OrganizationService,
    private termsService: TermService,
  ) { }

  ngOnInit() {
    this.contracts$ = this.documentService.valueChanges({ waterfallId: this.movieId }).pipe(
      startWith([]),
      map(documents => documents.filter(d => isContract(d))),
      map(documents => sortContracts(documents.map(d => convertDocumentTo<WaterfallContract>(d)))),
      map(rawContracts => {
        const contracts: Partial<Record<RightholderRole, WaterfallContract[]>> = {};
        Object.keys(rightholderRoles)
          .filter(r => r !== 'producer')
          // Fetch all root contracts for each role
          .forEach((r: RightholderRole) => contracts[r] = rawContracts.filter(c => c.type === r && !c.rootId));
        return contracts;
      }),
      tap(rawContracts => this.contracts = rawContracts)
    )

    this.waterfall$ = this.waterfallService.valueChanges(this.movieId).pipe(
      tap(waterfall => this.waterfall = waterfall)
    );
  }

  select(role: RightholderRole) {
    this.selected = role;
    this.creating = this.contracts[role].length === 0; // if we select an empty role we automatically switch to create mode
    if (this.creating) {
      this.documentForm.reset({ id: this.documentService.createId() });
    }
  }

  create() {
    this.creating = true;
    this.documentForm.reset({ id: this.documentService.createId() });
  }

  async edit(contract: WaterfallContract) {
    const terms = await this.termsService.getValue(contract.termIds);
    const licensee = this.waterfall.rightholders.find(r => r.id === contract.buyerId);
    const licensor = this.waterfall.rightholders.find(r => r.id === contract.sellerId);
    const file = this.waterfall.documents.find(f => f.id === contract.id);
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
      terms,
      file: file,
      expensesConfig: contract.expensesConfig,
    });
    this.creating = true;
  }

  removeFile(bool: boolean) {
    this.removeFileOnSave = bool;
  }

  async save() {
    // TODO check form validity

    // Seller create/update
    let sellerId: string;
    const { rightholders } = this.waterfall;
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
    if (!existingBuyer) {
      buyerId = this.waterfallService.createId();
      rightholders.push(createWaterfallRightholder({
        id: buyerId,
        name: this.documentForm.controls.licenseeName.value,
        roles: [this.selected],
      }));
    } else {
      buyerId = existingBuyer.id;
      // TODO add selected role if needed
    }

    await this.waterfallService.update({ id: this.movieId, rightholders });

    const expensesConfig = this.documentForm.controls.expensesConfig.value.map(c => createExpensesConfig({ ...c, id: c.id || this.documentService.createId() }));

    const document = createWaterfallDocument<WaterfallContract>({
      id: this.documentForm.controls.id.value,
      name: this.documentForm.controls.name.value,
      type: 'contract',
      waterfallId: this.movieId,
      signatureDate: this.documentForm.controls.signatureDate.value,
      ownerId: this.orgService.org.id,
      meta: createWaterfallContract({
        type: this.selected,
        status: 'accepted',
        buyerId, // licensee
        sellerId, // licensor
        duration: {
          from: this.documentForm.controls.startDate.value,
          to: this.documentForm.controls.endDate.value,
        },
        price: this.documentForm.controls.price.value,
        expensesConfig,
      }),
    });

    const terms = (this.documentForm.controls.terms.value ?? []).map(term => createTerm({
      ...term,
      id: term.id || this.termsService.createId(),
      contractId: document.id,
      titleId: this.waterfall.id
    }));
    document.meta.termIds = terms.map(t => t.id);

    await Promise.all([
      this.documentService.upsert<WaterfallDocument>(document, { params: { waterfallId: this.movieId } }),
      this.termsService.upsert(terms)
    ]);

    if (this.removeFileOnSave) {
      this.documentService.removeFile({ waterfallId: this.waterfall.id, documentId: document.id });
    } else {
      this.uploaderService.upload();
    }
    this.documentForm.markAsPristine();
  }
}

@Pipe({ name: 'getFile' })
export class GetFilePipe implements PipeTransform {
  transform(contractId: string, waterfall: Waterfall): WaterfallFile {
    const file = waterfall.documents.find(f => f.id === contractId);
    return file;
  }
}