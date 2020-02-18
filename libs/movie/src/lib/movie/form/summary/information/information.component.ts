import { Component, ChangeDetectionStrategy, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { MovieMainForm } from '../../main/main.form';

@Component({
  selector: '[main] movie-summary-information',
  templateUrl: './information.component.html',
  styleUrls: ['./information.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieSummaryInformationComponent implements OnInit {
  @Input() main: MovieMainForm;
  @Input() link: string;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.main.valueChanges.subscribe(_ => this.cdr.markForCheck());
  }

  public get genres() {
    return [this.main.genres, ...this.main.customGenres.controls];
  }
}
