import { Component, OnInit } from '@angular/core';
import { MovieForm } from '@blockframes/movie/form/movie.form';

@Component({
  selector: 'catalog-movie-tunnel-credits',
  templateUrl: './credits.component.html',
  styleUrls: ['./credits.component.scss']
})
export class CreditsComponent implements OnInit {

  constructor(private form: MovieForm) { }

  get productionYear() {
    return this.form.get('main').get('productionYear');
  }

  get productionCompanies() {
    return this.form.get('main').get('productionCompanies');
  }

  ngOnInit() {
  }

}
