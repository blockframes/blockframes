
import { BehaviorSubject } from 'rxjs';
import { Component, ChangeDetectionStrategy, ViewChild, Input, OnInit, Pipe, PipeTransform, Output, EventEmitter } from '@angular/core';

import { WaterfallService } from '@blockframes/waterfall/waterfall.service';
import { FileUploaderService } from '@blockframes/media/file-uploader.service';
import { WaterfallDocumentForm } from '@blockframes/waterfall/form/document.form';
import { CardModalComponent } from '@blockframes/ui/card-modal/card-modal.component';
import { WaterfallDocumentsService } from '@blockframes/waterfall/documents.service';
import {
  RightholderRole,
  Waterfall,
  WaterfallContract,
  WaterfallDocument,
  createWaterfallContract,
  createWaterfallDocument,
  rightholderRoles,
  createTerm
} from '@blockframes/model';
import { TermService } from '@blockframes/contract/term/service';

@Component({
  selector: '[movieId] waterfall-contracts-form',
  templateUrl: './contracts-form.component.html',
  styleUrls: ['./contracts-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContractsFormComponent implements OnInit {

  contracts$ = new BehaviorSubject<Partial<Record<RightholderRole, WaterfallContract[]>>>({});

  @ViewChild(CardModalComponent) cardModal: CardModalComponent;

  selected?: RightholderRole;

  creating = false;

  waterfall: Waterfall;

  @Input() movieId: string;
  @Input() documentForm = new WaterfallDocumentForm({ id: this.documentService.createId() });

  @Output() skip = new EventEmitter();

  constructor(
    private waterfallService: WaterfallService,
    private uploaderService: FileUploaderService,
    private documentService: WaterfallDocumentsService,
    private termsService: TermService,
  ) {
    const newContracts: Partial<Record<RightholderRole, WaterfallContract[]>> = {};
    Object.keys(rightholderRoles).forEach(r => newContracts[r] = []);
    this.contracts$.next(newContracts);
  }

  async ngOnInit() {
    this.waterfall = await this.waterfallService.getValue(this.movieId);
    const rawContracts = await this.documentService.getContracts(this.waterfall.id);
    const newContracts = this.contracts$.getValue();
    rawContracts.forEach(contract => {
      const rightholder = this.waterfall.rightholders.find(r => r.id === contract.buyerId);
      if (!rightholder) return; // ! malformed data
      rightholder.roles.forEach(role => {
        newContracts[role] ||= [];
        newContracts[role].push(contract);
      });
    });
    this.contracts$.next(newContracts);
  }

  select(role: RightholderRole) {
    this.selected = role;
    this.creating = this.contracts$.getValue()[role].length === 0; // if we select an empty role we automatically switch to create mode
  }

  create() {
    this.creating = true;
    this.documentForm = new WaterfallDocumentForm({ id: this.documentService.createId() });
    this.documentForm.markAsPristine();
  }

  async edit(contract: WaterfallContract) {
    const terms = await this.termsService.getValue(contract.termIds);
    const licensee = this.waterfall.rightholders.find(r => r.id === contract.buyerId);
    const licensor = this.waterfall.rightholders.find(r => r.id === contract.sellerId);
    const file = this.waterfall.documents.find(f => f.id === contract.id);
    this.documentForm = new WaterfallDocumentForm({
      id: contract.id,
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
    });
    this.creating = true;
    this.documentForm.markAsPristine();
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
      rightholders.push({
        id: sellerId,
        name: this.documentForm.controls.licensorName.value,
        roles: this.documentForm.controls.licensorRole.value,
      });
    }

    // Buyer create/update
    let buyerId: string;
    const existingBuyer = rightholders.find(r => r.name === this.documentForm.controls.licenseeName.value);
    if (!existingBuyer) {
      buyerId = this.waterfallService.createId();
      rightholders.push({
        id: buyerId,
        name: this.documentForm.controls.licenseeName.value,
        roles: [this.selected],
      });
    } else {
      buyerId = existingBuyer.id;
      // TODO add selected role if needed
    }

    await this.waterfallService.update({ id: this.movieId, rightholders });

    const document = createWaterfallDocument<WaterfallContract>({
      id: this.documentForm.controls.file.controls.id.value,
      type: 'contract',
      waterfallId: this.movieId,
      signatureDate: this.documentForm.controls.signatureDate.value,
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

    this.uploaderService.upload();
    this.documentForm.markAsPristine();
  }
}


@Pipe({ name: 'rightholderName' })
export class RightHolderNamePipe implements PipeTransform {
  transform(value: string, waterfall: Waterfall): string {
    const rightholder = waterfall.rightholders.find(r => r.id === value);
    if (!rightholder) return 'Unknown'; // ! malformed data
    return rightholder.name;
  }
}