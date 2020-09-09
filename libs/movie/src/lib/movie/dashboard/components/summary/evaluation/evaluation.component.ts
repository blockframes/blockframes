// Angular
import { Component, ChangeDetectionStrategy, Input, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';

import { MovieForm } from '../../../../form/movie.form';

// RxJs
import { Subscription } from 'rxjs';

@Component({
  selector: '[movie] movie-summary-evaluation',
  templateUrl: './evaluation.component.html',
  styleUrls: ['./evaluation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieSummaryEvaluationComponent implements OnInit, OnDestroy {
  @Input() movie: MovieForm;
  @Input() link: string;

  private sub: Subscription;

  constructor(private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.sub = this.movie.valueChanges.subscribe(_ => this.cdr.markForCheck());
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
  }
}
