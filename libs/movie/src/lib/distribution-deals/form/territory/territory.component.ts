import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: '[form] distribution-form-territory',
  templateUrl: './territory.component.html',
  styleUrls: ['./territory.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DistributionDealTerritoryComponent {
  @Input() form;
}
