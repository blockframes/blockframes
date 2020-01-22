import { TimeUnit, Event } from '@blockframes/utils/common-interfaces/terms';
import { FormControl } from '@angular/forms';
import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { DistributionDealTermsForm } from './terms.form';
import { MatSlideToggleChange } from '@angular/material';

@Component({
  selector: '[form] distribution-form-terms',
  templateUrl: './terms.component.html',
  styleUrls: ['./terms.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DistributionDealTermsComponent {
  @Input() form: DistributionDealTermsForm;

  public eventEnum = Event;

  public events = Object.keys(Event);

  public durations = Object.keys(TimeUnit);

  public termCtrl: FormControl = new FormControl(true);

  public disableInputs(event: MatSlideToggleChange, type: 'period' | 'event') {
    // TODO (MF) not finished #1419
    if (type === 'period') {
      this.form.get('start').disable();
      this.form.get('end').disable();
    }
  }
}
