import {
  Component, Input, TemplateRef, ContentChild, ChangeDetectionStrategy
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DetailedTermsComponent } from '@blockframes/contract/term/components/detailed/detailed.component';
import { HoldbackModalComponent } from '../../holdback/modal/holdback-modal.component';
import { OrganizationService } from '@blockframes/organization/service';
import { BucketContract, Holdback, Sale, Scope, mediaGroup, territoriesGroup } from '@blockframes/model';
import { createModalData } from '@blockframes/ui/global-modal/global-modal.component';
import { boolean } from '@blockframes/utils/decorators/decorators';

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
  mediaGroup = mediaGroup;
  territoriesGroup = territoriesGroup;
  orgId = this.orgService.org.id;
  @Input() contract: BucketContract | Sale;
  @Input() @boolean disableViewTerm:boolean;

  @ContentChild('priceTemplate') priceTemplate: TemplateRef<unknown>;
  @ContentChild('termAction') actionTemplate?: TemplateRef<unknown>;

  constructor(
    private dialog: MatDialog,
    private orgService: OrganizationService,
  ) { }

  openDetails(terms: string[], scope: Scope) {
    this.dialog.open(DetailedTermsComponent, { data: createModalData({ terms, scope }), autoFocus: false });
  }

  openHoldbackModal(holdbacks: Holdback[]) {
    this.dialog.open(HoldbackModalComponent, { data: createModalData({ holdbacks }) });
  }

}

