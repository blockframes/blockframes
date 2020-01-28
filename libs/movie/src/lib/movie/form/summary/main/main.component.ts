import { Component, ChangeDetectionStrategy, Input, ChangeDetectorRef, OnInit } from '@angular/core';
import { MovieMainForm } from '@blockframes/movie/movieform/main/main.form';

@Component({
  selector: '[main] movie-summary-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieSummaryMainComponent implements OnInit {
  @Input() main: MovieMainForm;
  @Input() link: string;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.main.valueChanges.subscribe(_ => this.cdr.markForCheck());
  }
}
