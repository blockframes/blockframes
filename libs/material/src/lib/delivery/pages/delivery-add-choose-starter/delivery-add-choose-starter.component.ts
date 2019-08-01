import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';
import { ActionItem } from '@blockframes/ui';

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
  items: ActionItem[] = [
    { icon: 'order', title: 'Choose a template', description: 'Lorem ipsum', routerLink: 'a' },
    { icon: 'order', title: 'Import material list', description: 'Lorem ipsum', routerLink: 'a' },
    {
      icon: 'order',
      title: 'Import specific delivery list',
      description: 'Lorem ipsum',
      routerLink: 'a'
    },
    { icon: 'order', title: 'Blank', description: 'Lorem ipsum', routerLink: 'a' }
  ];

  constructor(private router: Router) {}
}
