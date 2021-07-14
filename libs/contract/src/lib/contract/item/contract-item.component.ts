import {
  Component, Input, TemplateRef, ContentChild, ChangeDetectorRef, ChangeDetectionStrategy,
} from '@angular/core';
import { BucketContract } from '@blockframes/contract/bucket/+state/bucket.model';
import { Scope, mediaGroup, territoriesGroup } from '@blockframes/utils/static-model';
import { MatDialog } from '@angular/material/dialog';
import { DetailedTermsComponent } from '@blockframes/contract/term/components/detailed/detailed.component';


@Component({
  selector: 'contract-item',
  templateUrl: './contract-item.component.html',
  styleUrls: ['./contract-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // eslint-disable-next-line
  host: {
    'class': 'surface',
    'test-id': 'avails-section'
  }
})
export class ContractItemComponent {
  initialColumns = ['duration', 'territories', 'medias', 'exclusive', 'languages', 'runs.broadcasts'];
  columns = {
    'duration': 'Terms',
    'territories': 'Territories',
    'medias': 'Rights',
    'exclusive': 'Exclusivity',
    'languages': 'Versions',
    'runs.broadcasts': '# of Broadcasts',
  };
  mediaGroup = mediaGroup;
  territoriesGroup = territoriesGroup;
  actionTemplate?: TemplateRef<unknown>;
  @Input() contract: BucketContract;
  @ContentChild('priceTemplate') priceTemplate: TemplateRef<unknown>;
  @ContentChild('termAction') set colActionsTemplate(template: TemplateRef<unknown>) {
    if (template) {
      this.initialColumns.push('action');
      this.actionTemplate = template;
      this.cdr.markForCheck();
    }
  }

  constructor(
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
  ) { }


  openDetails(terms: string, scope: Scope) {
    this.dialog.open(DetailedTermsComponent, { data: { terms, scope } });
  }

}

