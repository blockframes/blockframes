import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MovieTunnelComponent } from '../movie-tunnel.component';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';

@Component({
  selector: 'catalog-movie-tunnel-evaluation',
  templateUrl: './evaluation.component.html',
  styleUrls: ['./evaluation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EvaluationComponent {
  form = this.tunnel.form;

  constructor(private tunnel: MovieTunnelComponent, private dynTitle: DynamicTitleService) {
    this.dynTitle.setPageTitle('Marketplace Valuation', 'Title information')
  }

  // get salesInfo() {
  //   return this.form.get('salesInfo');
  // }
}
