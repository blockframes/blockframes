// Angular
import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { boolean } from '@blockframes/utils/decorators/decorators';

import { Statement, Waterfall, Movie, WaterfallContract, WaterfallSource } from '@blockframes/model';

@Component({
  selector: 'waterfall-statement-main-info',
  templateUrl: './statement-main-info.component.html',
  styleUrls: ['./statement-main-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatementMainInfoComponent {
  @Input() statement: Statement;
  @Input() waterfall: Waterfall;
  @Input() movie: Movie;
  @Input() contract: WaterfallContract;
  @Input() sources: WaterfallSource[];
  @Input() @boolean showLink = false;
  @Input() @boolean lite = false;
  public noSources = $localize`Receipt sources not specified`;
}
