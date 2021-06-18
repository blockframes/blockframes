import {
  Component, Input, TemplateRef, ContentChild, ChangeDetectorRef,
} from '@angular/core';
import { BucketContract } from '@blockframes/contract/bucket/+state/bucket.model';
import { Scope } from '@blockframes/utils/static-model';
import { MatDialog } from '@angular/material/dialog';
import { DetailedTermsComponent } from '@blockframes/contract/term/components/detailed/detailed.component';

@Component({
  selector: 'contract-item',
  templateUrl: './contract-item.component.html',
  styleUrls: ['./contract-item.component.scss']
})
export class ContractItemComponent {

  constructor(
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
  ) { }

  @Input() contract: BucketContract;
  @ContentChild('priceTemplate') priceTemplate: TemplateRef<unknown>;
  initialColumns = ['duration', 'territories', 'medias', 'exclusive'];
  @Input() columns: Record<string, string>;
  actionTemplate?: TemplateRef<unknown>;

  @ContentChild('colActionTemplate') set colActionsTemplate(template: TemplateRef<unknown>) {
    if (template) {
      this.initialColumns.push('action');
      this.actionTemplate = template;
      this.cdr.markForCheck();
    }
  }

  trackById = (i: number, doc: { id: string }) => doc.id;

  openDetails(terms: string, scope: Scope) {
    this.dialog.open(DetailedTermsComponent, { data: { terms, scope } });
  }

}

