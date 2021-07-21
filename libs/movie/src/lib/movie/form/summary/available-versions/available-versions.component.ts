import { Component, Input, OnInit } from '@angular/core';
import { MovieForm } from '@blockframes/movie/form/movie.form';

@Component({
  selector: '[movie][link] movie-summary-available-versions',
  templateUrl: './available-versions.component.html',
  styleUrls: ['./available-versions.component.scss']
})
export class SummaryAvailableVersionsComponent implements OnInit {

  @Input() movie: MovieForm;
  @Input() link: string;

  public versionLength: number;

  ngOnInit() {
    this.versionLength = Object.keys(this.movie.languages.controls).length;
  }
}
