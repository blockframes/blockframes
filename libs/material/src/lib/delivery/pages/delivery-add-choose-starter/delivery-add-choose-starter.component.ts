import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';

/**
 * Page for the flow: "create a delivery"
 * second step, choose a starter template.
 */
@Component({
  selector: 'delivery-add-choose-starter',
  templateUrl: './delivery-add-choose-starter.component.html',
  styleUrls: ['./delivery-add-choose-starter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeliveryAddChooseStarterComponent {
  constructor(private router: Router) {}
}
