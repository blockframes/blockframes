import { Component, OnInit } from '@angular/core';
import { MovieForm } from '@blockframes/movie/form/movie.form';

@Component({
  selector: '[formGroup] movie-theatrical-release, [formGroupName] movie-theatrical-release',
  templateUrl: './theatrical-release.component.html',
  styleUrls: ['./theatrical-release.component.scss']
})
export class TheatricalReleaseComponent implements OnInit {

  constructor(private form: MovieForm) { }

  get salesInfo() {
    return this.form.get('salesInfo');
  }

  ngOnInit() {
  }

}
