
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';


@Component({
  selector: 'waterfall-graph-label',
  templateUrl: './label.component.html',
  styleUrls: ['./label.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WaterfallGraphLabelComponent {

  @Input() amount: number;

}