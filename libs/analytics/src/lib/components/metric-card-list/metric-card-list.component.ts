import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from "@angular/core";
import { boolean } from "@blockframes/utils/decorators/decorators";

export interface MetricCard {
  title: string;
  value: number;
  icon: string;
  selected?: boolean;
}

@Component({
  selector: '[cards] analytics-metric-card-list',
  templateUrl: './metric-card-list.component.html',
  styleUrls: ['./metric-card-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MetricCardListComponent {
  private selected = '';

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