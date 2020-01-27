import { Subscription } from 'rxjs';
import { TimeUnit, Event } from '@blockframes/utils/common-interfaces/terms';
import { FormControl } from '@angular/forms';
import { Component, Input, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { DistributionDealTermsForm } from './terms.form';
import { tap, startWith } from 'rxjs/operators';

@Component({
  selector: '[form] distribution-form-terms',
  templateUrl: './terms.component.html',
  styleUrls: ['./terms.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DistributionDealTermsComponent implements OnInit, OnDestroy {
  @Input() form: DistributionDealTermsForm;
  public eventEnum = Event;

  public events = Object.keys(Event);

  public durations = Object.keys(TimeUnit);

  public periodCtrl: FormControl = new FormControl(false);

  public eventCtrl: FormControl = new FormControl(true);

  private periodSub: Subscription;

  private eventSub: Subscription;

  ngOnInit() {
    this.periodSub = this.periodCtrl.valueChanges
      .pipe(
        startWith(this.periodCtrl.value),
        tap(value => {
          value
            ? (this.form.get('start').enable(), this.form.get('end').enable())
            : (this.form.get('start').disable(), this.form.get('end').disable());
        })
      )
      .subscribe();
    this.eventSub = this.eventCtrl.valueChanges
      .pipe(
        startWith(this.eventCtrl.value),
        tap(value => {
          value
            ? (this.form.get('floatingDuration').enable(), this.form.get('floatingStart').enable())
            : (this.form.get('floatingDuration').disable(value),
              this.form.get('floatingStart').disable(value));
        })
      )
      .subscribe();
  }

  ngOnDestroy() {
    this.periodSub.unsubscribe();
    this.eventSub.unsubscribe();
  }
}
