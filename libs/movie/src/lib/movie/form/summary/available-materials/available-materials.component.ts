import { Component, Input, OnInit } from '@angular/core';
import { MovieForm } from '@blockframes/movie/form/movie.form';

@Component({
  selector: '[movie][link] movie-summary-available-materials',
  templateUrl: './available-materials.component.html',
  styleUrls: ['./available-materials.component.scss']
})
export class SummaryAvailableMaterialsComponent implements OnInit {

  @Input() movie: MovieForm;
  @Input() link: string;

  public versionLength: number;

  ngOnInit() {
    this.versionLength = Object.keys(this.movie.languages.controls).length;
  }
}
