import { Component, OnInit } from '@angular/core';
import { MovieForm } from '@blockframes/movie/movie/form/movie.form';
import { FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'movie-tunnel-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class TunnelMainComponent implements OnInit {

  public theatricalData = new FormGroup({
    theatricalRelease: new FormControl(),
    originCountryReleaseDate: new FormControl()
  })
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
