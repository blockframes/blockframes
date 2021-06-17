import { Component, Input, Output, EventEmitter, TemplateRef, ContentChild } from '@angular/core';
import { BucketContract } from '@blockframes/contract/bucket/+state/bucket.model';
import { Scope } from '@blockframes/utils/static-model';

@Component({
  selector: 'contract-footer',
  template: `
    <ng-content></ng-content>
  `
})
export class ContractFooterComponent {
}

@Component({
  selector: 'contract-price',
  template: `
    <ng-content></ng-content>
  `
})
export class ContractPriceComponent {
}

@Component({
  selector: 'contract-item',
  templateUrl: './contrac-item.component.html',
  styleUrls: ['./contrac-item.component.scss']
})
export class ContracItemComponent {

  @Input() contract: BucketContract;
  @ContentChild('priceTemplate') priceTemplate: TemplateRef<unknown>;
  @ContentChild('colActionTemplate') colActionsTemplate: TemplateRef<unknown>;
  @Input() columns: Record<string, string>;
  @Input() initialColumns: string[];
  @Output() openDetails = new EventEmitter<{ terms: string, scope: Scope }>();

  trackById = (i: number, doc: { id: string }) => doc.id;

  get showColActionsTemplate() {
    return Boolean(this.colActionsTemplate);
  }

  _openDetails(terms: string, scope: Scope) {
    this.openDetails.emit({ terms, scope })
  }
}

