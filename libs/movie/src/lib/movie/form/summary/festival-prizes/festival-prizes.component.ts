import { Component, ChangeDetectionStrategy, Input, ChangeDetectorRef, OnInit } from '@angular/core';
import { MovieFestivalPrizesForm, MoviePrizeForm } from '@blockframes/movie/movie/form/festival-prizes/festival-prizes.form';

@Component({
  selector: '[festivalPrizes] movie-summary-festival-prizes',
  templateUrl: './festival-prizes.component.html',
  styleUrls: ['./festival-prizes.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieSummaryFestivalPrizesComponent implements OnInit {
  @Input() festivalPrizes: MovieFestivalPrizesForm;
  @Input() link: string;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.festivalPrizes.valueChanges.subscribe(_ => this.cdr.markForCheck());
  }

  public festivalPrizeHasNoValue(festivalPrize: MoviePrizeForm) {
    return !festivalPrize.get('name').value || !festivalPrize.get('prize').value || !festivalPrize.get('year').value || !festivalPrize.get('premiere').value;
  }
}
