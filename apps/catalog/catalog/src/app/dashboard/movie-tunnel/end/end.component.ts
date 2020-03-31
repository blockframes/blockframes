import { Component, ChangeDetectionStrategy } from '@angular/core';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';

@Component({
  selector: 'catalog-end-tunnel',
  templateUrl: './end.component.html',
  styleUrls: ['./end.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class EndTunnelComponent {
  constructor(private dynTitle: DynamicTitleService) {
    this.dynTitle.setPageTitle('Successfully submitted')
  }
}
