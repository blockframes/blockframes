// Angular
import { Component, ChangeDetectionStrategy } from '@angular/core';

// Blockframes
import { waterfall } from '@blockframes/waterfall/main';
import { actions } from '@blockframes/waterfall/fixtures/terrawilly-demo';


@Component({
  selector: 'waterfall-title-waterfall',
  templateUrl: './waterfall.component.html',
  styleUrls: ['./waterfall.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WaterfallComponent {

  tree = waterfall('terrawilly-demo', actions);
}
