import {
  Component, Input, TemplateRef, ContentChild, ChangeDetectionStrategy
} from '@angular/core';
import { BucketContract } from '@blockframes/model';
import { Scope, mediaGroup, territoriesGroup } from '@blockframes/utils/static-model';
import { MatDialog } from '@angular/material/dialog';
import { DetailedTermsComponent } from '@blockframes/contract/term/components/detailed/detailed.component';
import { HoldbackModalComponent } from '../../holdback/modal/holdback-modal.component';
import { OrganizationService } from '@blockframes/organization/+state';
import { Holdback, Sale } from '@blockframes/model';



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

  openDetails(terms: string[], scope: Scope) {
    this.dialog.open(DetailedTermsComponent, { data: { terms, scope }, maxHeight: '80vh', autoFocus: false });
  }

  openHoldbackModal(existingHoldbacks: Holdback[]) {
    this.dialog.open(HoldbackModalComponent, { data: { holdbacks: existingHoldbacks }, maxHeight: '80vh' });
  }

}

