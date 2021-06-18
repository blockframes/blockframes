import { Component, Input, Output, EventEmitter, TemplateRef, ContentChild, ChangeDetectorRef } from '@angular/core';
import { BucketContract } from '@blockframes/contract/bucket/+state/bucket.model';
import { Scope } from '@blockframes/utils/static-model';


@Component({
  selector: 'contract-item',
  templateUrl: './contract-item.component.html',
  styleUrls: ['./contract-item.component.scss']
})
export class ContractItemComponent {

  constructor(
    private cdr: ChangeDetectorRef,
  ) { }

  @Input() contract: BucketContract;
  @ContentChild('priceTemplate') priceTemplate: TemplateRef<unknown>;
  initialColumns = ['duration', 'territories', 'medias', 'exclusive'];
  @Input() columns: Record<string, string>;
  @Output() openDetails = new EventEmitter<{ terms: string, scope: Scope }>();

  actionTemplate?: TemplateRef<unknown>;
  @ContentChild('colActionTemplate') set colActionsTemplate(template: TemplateRef<unknown>) {
    if (template) {
      this.initialColumns.push('action');
      this.actionTemplate = template;
      this.cdr.markForCheck();
    }
  }

  trackById = (i: number, doc: { id: string }) => doc.id;

  _openDetails(terms: string, scope: Scope) {
    this.openDetails.emit({ terms, scope })
  }
}

