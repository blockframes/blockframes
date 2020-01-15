import { Component, OnInit } from '@angular/core';
import { MovieForm } from '@blockframes/movie/movie/form/movie.form';

@Component({
  selector: 'catalog-movie-tunnel-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class TunnelMainComponent implements OnInit {

  constructor(private form: MovieForm) { }

  get main() {
    return this.form.get('main');
  }

  get salesInfo() {
    return this.form.get('salesInfo');
  }

  ngOnInit() {
  }

}
