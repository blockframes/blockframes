import { Subscription } from 'rxjs';
import { TimeUnit, Event } from '@blockframes/utils/common-interfaces/terms';
import { FormControl } from '@angular/forms';
import { Component, Input, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { DistributionDealTermsForm } from './terms.form';
import { tap, startWith } from 'rxjs/operators';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';

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
    // If start is defined we want to change the toggle button state
    if (!!this.form.value.start) {
      this.periodCtrl.setValue(true);
      this.eventCtrl.setValue(false);
    }
    this.periodSub = this.periodCtrl.valueChanges
      .pipe(
        startWith(!!this.form.value.start && !!this.form.value.end),
        tap(value => this.toggleForm(['start', 'end'], value))
      )
      .subscribe();
    this.eventSub = this.eventCtrl.valueChanges
      .pipe(
        startWith(!!this.form.value.floatingDuration),
        tap(value => this.toggleForm(['floatingDuration', 'floatingStart'], value))
      )
      .subscribe();
  }

  private toggleForm(formNames: string[], value: boolean) {
    for (const name of formNames) {
      const form = this.form.get(name as 'start' | 'end' | 'floatingStart' | 'floatingDuration');
      value ? form.enable() : form.disable();
    }
  }

  public updateState(event: MatSlideToggleChange, type: 'event' | 'period') {
    // We need a type here otherwise we get a recursion
    if (type === 'event') {
      this.periodCtrl.setValue(event.checked);
      this.eventCtrl.setValue(!this.eventCtrl.value);
    } else {
      this.periodCtrl.setValue(!this.periodCtrl.value);
      this.eventCtrl.setValue(event.checked);
    }
  }

  ngOnDestroy() {
    this.periodSub.unsubscribe();
    this.eventSub.unsubscribe();
  }
}
