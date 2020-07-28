import { Component, ChangeDetectionStrategy, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { MovieForm } from '../../movie.form';

@Component({
  selector: '[movie] movie-summary-information',
  templateUrl: './information.component.html',
  styleUrls: ['./information.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieSummaryInformationComponent implements OnInit {
  @Input() movie: MovieForm;
  @Input() link: string;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.movie.valueChanges.subscribe(_ => this.cdr.markForCheck());
  }

  public get genres() {
    return [this.movie.genres, ...this.movie.customGenres.controls];
  }
}
