// Angular
import {
  Component,
  ChangeDetectionStrategy,
  Input,
  ChangeDetectorRef,
  OnInit,
  OnDestroy
} from '@angular/core';

import { MovieForm } from '../../../../form/movie.form';

// RxJs
import { Subscription } from 'rxjs';

@Component({
  selector: '[movie] movie-summary-technical-information',
  templateUrl: './technical-information.component.html',
  styleUrls: ['./technical-information.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieSummaryTechnicalInformationComponent implements OnInit, OnDestroy {
  @Input() movie: MovieForm;
  @Input() link: string;

  private sub: Subscription;

  constructor(private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.sub = this.movie.valueChanges.subscribe(_ => this.cdr.markForCheck());
  }

  get hasKeys() {
    return Object.keys(this.movie.controls).length;
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
  }
}
