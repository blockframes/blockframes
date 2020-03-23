import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MovieTunnelComponent } from '../movie-tunnel.component';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'catalog-movie-tunnel-evaluation',
  templateUrl: './evaluation.component.html',
  styleUrls: ['./evaluation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EvaluationComponent {
  form = this.tunnel.form;

  constructor(private tunnel: MovieTunnelComponent, private title: Title) {
    this.title.setTitle('Marketplace Valuation - Title information - Archipel Content')
  }

  get salesInfo() {
    return this.form.get('salesInfo');
  }
}
