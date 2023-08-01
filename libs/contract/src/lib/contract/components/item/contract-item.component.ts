import {
  Component, Input, TemplateRef, ContentChild, ChangeDetectionStrategy
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { HoldbackModalComponent } from '../../holdback/modal/holdback-modal.component';
import { OrganizationService } from '@blockframes/organization/service';
import { BucketContract, Holdback, Sale, Scope, mediaGroup, territoriesGroup } from '@blockframes/model';
import { createModalData } from '@blockframes/ui/global-modal/global-modal.component';
import { DetailedGroupComponent } from '@blockframes/ui/detail-modal/detailed.component';

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

  @ContentChild('priceTemplate') priceTemplate: TemplateRef<unknown>;
  @ContentChild('termAction') actionTemplate?: TemplateRef<unknown>;

  constructor(
    private dialog: MatDialog,
    private orgService: OrganizationService,
  ) { }

  openDetails(items: string[], scope: Scope) {
    this.dialog.open(DetailedGroupComponent, { data: createModalData({ items, scope }), autoFocus: false });
  }

  openHoldbackModal(holdbacks: Holdback[]) {
    this.dialog.open(HoldbackModalComponent, { data: createModalData({ holdbacks }) });
  }

}

