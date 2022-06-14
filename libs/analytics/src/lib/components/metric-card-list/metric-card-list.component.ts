import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from "@angular/core";
import { AggregatedAnalytic, EventName } from "@blockframes/model";
import { boolean } from "@blockframes/utils/decorators/decorators";
import { IconSvg } from '@blockframes/ui/icon.service';

export interface MetricCard {
  title: string;
  value: number | string;
  icon: string;
  selected?: boolean;
}

export interface VanityMetricEvent {
  name: EventName;
  title: string;
  icon: IconSvg;
};

export const events: VanityMetricEvent[] = [
  {
    name: 'pageView',
    title: 'Views',
    icon: 'visibility'
  },
  {
    name: 'promoReelOpened',
    title: 'Promoreel Opened',
    icon: 'star_fill'
  },
  {
    name: 'addedToWishlist',
    title: 'Adds to Wishlist',
    icon: 'favorite'
  },
  {
    name: 'screeningRequested',
    title: 'Screening Requested',
    icon: 'ask_screening_2'
  },
  {
    name: 'askingPriceRequested',
    title: 'Asking Price Requested',
    icon: 'local_offer'
  }
];

export function toCards(aggregated: AggregatedAnalytic): MetricCard[] {
  return events.map(event => ({
    title: event.title,
    value: aggregated[event.name],
    icon: event.icon,
    selected: false
  }));
}


@Component({
  selector: '[cards] analytics-metric-card-list',
  templateUrl: './metric-card-list.component.html',
  styleUrls: ['./metric-card-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MetricCardListComponent {
  public selected = '';
  @Input() cards: MetricCard[];
  @Input() @boolean selectable = false;

  @Output() selection: EventEmitter<string> = new EventEmitter();

  toggleSelect(title: string) {
    if (!this.selectable) return;

    for (const card of this.cards) {
      if (card.title === title) card.selected = true;
      if (card.title === this.selected) card.selected = false;
    }
    this.selected = title === this.selected ? '' : title;
    this.selection.next(this.selected);
  }
}
