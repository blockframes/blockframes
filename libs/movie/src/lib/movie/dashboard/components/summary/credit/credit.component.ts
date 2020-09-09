// Angular
import { Component, ChangeDetectionStrategy, Input, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';

// Form
import { CreditForm } from '../../../../form/sales-cast/sales-cast.form';
import { MovieForm } from '../../../../form/movie.form';

// RxJs
import { Subscription } from 'rxjs';

@Component({
  selector: '[movie] movie-summary-credit',
  templateUrl: './credit.component.html',
  styleUrls: ['./credit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieSummaryCreditComponent implements OnInit, OnDestroy {
  @Input() movie: MovieForm;
  @Input() link: string;

  private sub: Subscription;

  constructor(private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.sub = this.movie.valueChanges.subscribe(_ => this.cdr.markForCheck());
  }

  public producerHasNoValue(producer: CreditForm) {
    return !producer.get('firstName').value || !producer.get('lastName').value || !producer.get('role').value;
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe()
  }

}
