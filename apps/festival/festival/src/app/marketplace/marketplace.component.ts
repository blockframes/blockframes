import { Component, ChangeDetectionStrategy } from '@angular/core';
import { applicationUrl } from '@blockframes/utils/apps';
@Component({
  selector: 'festival-marketplace',
  templateUrl: './marketplace.component.html',
  styleUrls: ['./marketplace.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class MarketplaceComponent {
  public applicationUrl = applicationUrl;
}
