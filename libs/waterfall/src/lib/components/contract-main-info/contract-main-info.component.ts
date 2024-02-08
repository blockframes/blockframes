// Angular
import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { Movie, Term, Waterfall, WaterfallContract } from '@blockframes/model';

@Component({
  selector: 'waterfall-contract-main-info',
  templateUrl: './contract-main-info.component.html',
  styleUrls: ['./contract-main-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContractMainInfoComponent {

  @Input() contract: WaterfallContract & { terms: Term[] };
  @Input() movie: Movie;
  @Input() waterfall: Waterfall;

}
