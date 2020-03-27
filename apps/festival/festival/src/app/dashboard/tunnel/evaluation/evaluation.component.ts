import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MovieTunnelComponent } from '../movie-tunnel.component';

@Component({
  selector: 'catalog-movie-tunnel-evaluation',
  templateUrl: './evaluation.component.html',
  styleUrls: ['./evaluation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EvaluationComponent {
  form = this.tunnel.form;

  constructor(private tunnel: MovieTunnelComponent) { }

  get salesInfo() {
    return this.form.get('salesInfo');
  }
}
