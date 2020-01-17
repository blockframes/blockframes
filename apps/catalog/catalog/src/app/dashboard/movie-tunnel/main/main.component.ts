import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MovieForm } from '@blockframes/movie/movie/form/movie.form';

@Component({
  selector: 'catalog-movie-tunnel-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TunnelMainComponent implements OnInit {

  constructor(private form: MovieForm) { }

  get main() {
    return this.form.get('main');
  }

  get salesInfo() {
    return this.form.get('salesInfo');
  }

  get salesCast() {
    return this.form.get('salesCast');
  }

  get festivalPrizes() {
    return this.form.get('festivalPrizes');
  }

  ngOnInit() {
  }

}
