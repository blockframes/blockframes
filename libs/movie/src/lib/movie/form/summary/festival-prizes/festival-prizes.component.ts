import { Component, ChangeDetectionStrategy, Input, ChangeDetectorRef, OnInit } from '@angular/core';
import { MoviePrizeForm } from '../../movie.form';
import { MovieForm } from '../../movie.form';

@Component({
  selector: '[movie] movie-summary-festival-prizes',
  templateUrl: './festival-prizes.component.html',
  styleUrls: ['./festival-prizes.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieSummaryFestivalPrizesComponent implements OnInit {
  @Input() movie: MovieForm;
  @Input() link: string;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.movie.valueChanges.subscribe(_ => this.cdr.markForCheck());
  }

  public festivalPrizeHasNoValue(festivalPrize: MoviePrizeForm) {
    return !festivalPrize.get('name').value && !festivalPrize.get('prize').value && !festivalPrize.get('year').value && !festivalPrize.get('premiere').value;
  }
}
