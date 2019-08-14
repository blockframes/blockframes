import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { ActionPickerItem } from '@blockframes/ui';
import { MovieQuery } from '@blockframes/movie';
import { map } from 'rxjs/operators';

interface IDeliveryList {
  id: string;
  name: string;
  logo: string;
}

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
  public currentDeliveryList: IDeliveryList | undefined;

  constructor(private router: Router, private movieQuery: MovieQuery) {}

  public get continueURL(): string {
    if (!this.currentDeliveryList) {
      return '#';
    }

    const deliveryID = this.currentDeliveryList.id;
    const movieId = this.movieQuery.getActiveId();
    // TODO: refactor the other page to add template to the URL
    return `/layout/o/delivery/add/${movieId}/specific-delivery/${deliveryID}/4-settings`;
  }

  ngOnInit(): void {
    this.isLoading$ = of(false);
    this.items$ = of(ITEMS).pipe(
      map(xs => {
        return xs.map(x => ({
          title: x.name,
          payload: x,
          img: x.logo
        }));
      })
    );
  }

  public selectDeliveryList(deliveryList: IDeliveryList) {
    this.currentDeliveryList = deliveryList;
  }
}
