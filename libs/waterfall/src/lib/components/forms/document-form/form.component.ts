
// Angular
import { FormControl } from '@angular/forms';
import { add, Duration } from 'date-fns';
import { BehaviorSubject, Subscription, combineLatest } from 'rxjs';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { Component, ChangeDetectionStrategy, OnInit, Input, OnDestroy } from '@angular/core';

// Blockframes
import { Waterfall } from '@blockframes/model';
import { BucketTermForm, createBucketTermControl } from '@blockframes/contract/bucket/form';
import { WaterfallDocumentForm, WaterfallDocumentFormValue } from '@blockframes/waterfall/form/document.form';


@Component({
  selector: '[waterfall][form] waterfall-document-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocumentFormComponent implements OnInit, OnDestroy {

  @Input() waterfall: Waterfall;
  @Input() form: WaterfallDocumentForm;

  showStartDate$ = new BehaviorSubject(false);

  toggleTermsControl = new FormControl(true);
  durationControl = new FormControl<number | undefined>(undefined);

  periods: (keyof Duration)[] = ['days', 'weeks', 'months', 'years'];
  periodControl = new FormControl<keyof Duration | undefined>(undefined);

  licensee$ = new BehaviorSubject<string[]>([]); // buyer
  licensor$ = new BehaviorSubject<string[]>([]); // seller

  subscription: Subscription[] = [];

  ngOnInit() {
    if (this.form.controls.terms.length === 0) {
      this.addTerm();
    }
    const names = this.waterfall.rightholders.map(r => r.name);
    this.licensee$.next(names);
    this.licensor$.next(names);
    this.subscription.push(
      this.form.valueChanges.subscribe((value: WaterfallDocumentFormValue) => {
        const filtered = names.filter(n => n !== value.licenseeName && n !== value.licensorName);
        this.licensor$.next(filtered);
        this.licensee$.next(filtered);
        // TODO only display selected role for the licensee

        if (value.licensorName && value.licensorRole.length === 0) {
          const rightholder = this.waterfall.rightholders.find(r => r.name === value.licensorName);
          if (rightholder) this.form.controls.licensorRole.setValue(rightholder.roles, { emitEvent: false })
        }
      }),
      this.form.controls.endDate.valueChanges.subscribe(() => {
        this.durationControl.setValue(0);
        this.periodControl.setValue(undefined);
      }),
      combineLatest([
        this.durationControl.valueChanges,
        this.periodControl.valueChanges,
      ]).subscribe(([duration, period]) => {
        const newEndDate = add(this.form.controls.endDate.value, { [period]: duration });
        this.form.controls.endDate.setValue(newEndDate, { emitEvent: false });
      }),
    );

  }

  ngOnDestroy() {
    this.subscription.forEach(s => s.unsubscribe());
  }

  toggleStartDate(event: MatSlideToggleChange) {
    this.showStartDate$.next(event.checked);
  }

  // toggleRights(event:  MatButtonToggleChange) {
  //   this.showTerms$.next(event.value);
  // }

  addTerm() {
    this.form.controls.terms.push(BucketTermForm.factory({}, createBucketTermControl));
  }


}
