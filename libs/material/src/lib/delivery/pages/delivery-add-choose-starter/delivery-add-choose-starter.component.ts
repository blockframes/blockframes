import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActionItem } from '@blockframes/ui';
import { DeliveryStore, DeliveryWizardKind } from '../../+state';
import { Router } from '@angular/router';
import { MovieQuery } from '@blockframes/movie';

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
  items: ActionItem[];

  constructor(
    private store: DeliveryStore,
    private router: Router,
    private movieQuery: MovieQuery
  ) {
    this.onPickBlank = this.onPickBlank.bind(this);

    this.items = [
      {
        icon: 'order',
        title: 'Choose a template',
        description: 'Lorem ipsum',
        routerLink: '../3-pick-template'
      },
      { icon: 'order', title: 'Import material list', description: 'Lorem ipsum', routerLink: '#' },
      {
        icon: 'order',
        title: 'Import specific delivery list',
        description: 'Lorem ipsum',
        routerLink: '../3-pick-specific-delivery-list'
      },
      { icon: 'order', title: 'Blank', description: 'Lorem ipsum', action: this.onPickBlank }
    ];
  }

  public onPickBlank() {
    this.store.updateWizardState({ kind: DeliveryWizardKind.blankList });
    const movieId = this.movieQuery.getActiveId();
    this.router.navigate([`/layout/o/delivery/add/${movieId}/4-settings`]);
  }
}
