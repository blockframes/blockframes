import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from "@angular/core";
import { boolean } from "@blockframes/utils/decorators/decorators";

export interface MetricCard {
  title: string;
  value: number;
  icon: string;
  selected: boolean;
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
      card.selected = false;
    }

    const card = this.cards.find(card => card.title === title);
    if (this.selected !== title) {
      card.selected = true;
      this.selected = title;
    } else {
      this.selected = '';
    }
    this.selection.next(this.selected);






    // this.selected = selected;



    // if (card) {
    //   card.selected = !card.selected;
    //   const select = card.selected ? selected : '';
    //   this.selection.next(select);
    // } else {
    //   this.cards.forEach(card => card.selected = false);
    //   this.selection.next('');
    // }
  }
}