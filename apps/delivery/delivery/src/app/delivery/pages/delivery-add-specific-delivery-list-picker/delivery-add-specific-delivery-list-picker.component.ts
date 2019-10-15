import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { ActionPickerItem } from '@blockframes/ui';
import { MovieQuery } from '@blockframes/movie';
import { map } from 'rxjs/operators';
import { DeliveryStore, DeliveryWizardKind, IDeliveryList } from '../../+state';

const ITEMS: IDeliveryList[] = [
  {
    id: 'netflix',
    name: 'Netflix',
    logo: 'https://dummyimage.com/100x100/000000/fff&text=Netflix'
  },
  {
    id: 'canal',
    name: 'Canal+',
    logo: 'https://dummyimage.com/100x100/000000/fff&text=Canal%2B'
  },
  {
    id: 'cinecinema',
    name: 'Cine Cinema',
    logo: 'https://dummyimage.com/100x100/000000/fff&text=Cine%20Cinema'
  }
];

/**
 * Page for the flow: "create a delivery"
 * third step, choose a specific delivery list.
 */
@Component({
  selector: 'delivery-add-specific-delivery-list-picker',
  templateUrl: './delivery-add-specific-delivery-list-picker.component.html',
  styleUrls: ['./delivery-add-specific-delivery-list-picker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeliveryAddSpecificDeliveryListPickerComponent implements OnInit {
  public isLoading$: Observable<boolean>;
  public items$: Observable<ActionPickerItem<IDeliveryList>[]>;
  public currentDeliveryList?: IDeliveryList;

  constructor(
    private router: Router,
    private movieQuery: MovieQuery,
    private store: DeliveryStore
  ) {}

  public get continueURL(): string {
    if (!this.currentDeliveryList) {
      return '#';
    }

    const movieId = this.movieQuery.getActiveId();
    // TODO(issue#590): refactor the other page to add template to the URL
    // const deliveryID = this.currentDeliveryList.id;
    return `/layout/o/delivery/add/${movieId}/4-settings`;
  }

  ngOnInit(): void {
    // TODO(issue#590): load the specific delivery list content and feed this variable accordingly
    this.isLoading$ = of(false);
    this.items$ = of(ITEMS).pipe(
      map(items => {
        return items.map(x => ({
          title: x.name,
          payload: x,
          img: x.logo
        }));
      })
    );
  }

  public selectDeliveryList(deliveryList: IDeliveryList) {
    // TODO(issue#590): when we load specific deliveries from the server,
    //   move the management of "current delivery list" to an observable in the query
    this.store.updateWizard({
      kind: DeliveryWizardKind.specificDeliveryList,
      deliveryListId: deliveryList.id
    });
    this.currentDeliveryList = deliveryList;
  }
}
