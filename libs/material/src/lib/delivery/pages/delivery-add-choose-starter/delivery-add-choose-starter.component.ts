import { ChangeDetectionStrategy, Component, HostBinding } from '@angular/core';
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
  @HostBinding('attr.page-id') pageId = 'starter-picker';

  items: ActionItem[];

  constructor(
    private store: DeliveryStore,
    private router: Router,
    private movieQuery: MovieQuery
  ) {
    this.items = [
      {
        icon: 'template',
        title: 'From an existing template',
        description: 'Template you created earlier',
        routerLink: '../3-pick-template'
      },
      {
        icon: 'listMaterial',
        title: 'From existing materials',
        description: 'Use materials from other deliveries',
        action: () => this.onPickMaterialList()
      },
      {
        icon: 'blank',
        title: 'From scratch',
        description: 'Create a brand new delivery',
        action: () => this.onPickBlank()
      }
    ];
  }

  public onPickMaterialList() {
    this.store.updateWizard({ kind: DeliveryWizardKind.materialList });
    const movieId = this.movieQuery.getActiveId();
    this.router.navigate([`/layout/o/delivery/add/${movieId}/4-settings`]);
  }

  public onPickBlank() {
    this.store.updateWizard({ kind: DeliveryWizardKind.blankList });
    const movieId = this.movieQuery.getActiveId();
    this.router.navigate([`/layout/o/delivery/add/${movieId}/4-settings`]);
  }

  public getMovieName() {
    return this.movieQuery.getActive().main.title.original;
  }
}
