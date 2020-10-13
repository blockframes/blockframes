import { Component, ChangeDetectionStrategy, Input, OnInit, OnDestroy } from '@angular/core';
// Blockframes
import { CookiesConsent, CookiesConsentForm } from './cookie.form';
// Material
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MatRadioChange } from '@angular/material/radio';
import { Subscription } from 'rxjs';
import { startWith } from 'rxjs/operators';

@Component({
  selector: '[form] cookie-form',
  templateUrl: './cookie-form.component.html',
  styleUrls: ['./cookie-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CookieFormComponent implements OnInit, OnDestroy {

  @Input() form: CookiesConsentForm;

  public masterToggleStatus: 'accept' | 'reject' | 'other'
  private sub: Subscription;

  ngOnInit() {
    this.sub = this.form.valueChanges.pipe(startWith(this.form.value)).subscribe(data => {
      const allAccepted = Object.keys(data).every(key => data[key]);
      const allRejected = Object.keys(data).every(key => !data[key]);
      this.masterToggleStatus = allAccepted ? 'accept' : allRejected ? 'reject' : 'other';
    })
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  masterToggle(event: MatRadioChange) {
    for (const key in this.form.controls) {
      this.form.get(key as keyof CookiesConsent).setValue(event.value);
    }
  }

  toggleCookie(event: MatSlideToggleChange) {
    this.form.get(event.source.name as keyof CookiesConsent).setValue(event.checked);
  }

}
