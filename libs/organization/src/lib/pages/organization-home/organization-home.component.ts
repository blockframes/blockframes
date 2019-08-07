import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ActionItem } from '@blockframes/ui';

@Component({
  selector: 'organization-home',
  templateUrl: './organization-home.component.html',
  styleUrls: ['./organization-home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class OrganizationHomeComponent {
  items: ActionItem[] = [
    {
      routerLink: '../create',
      icon: 'adjustableWrench',
      title: 'Create your organization',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec luctus dictum metus quis sagittis.'
    },
    {
      routerLink: '../find',
      icon: 'magnifyingGlass',
      title: 'Find your organization',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec luctus dictum metus quis sagittis.'
    }
  ]
}
