import { Component, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { CookiesConsentForm } from './cookie.form';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { Subscription } from 'rxjs';
import { MatCheckboxChange } from '@angular/material/checkbox';

@Component({
  selector: 'cookie-form',
  templateUrl: './cookie-form.component.html',
  styleUrls: ['./cookie-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CookieFormComponent implements OnInit, OnDestroy {

  form = new CookiesConsentForm();

  sub: Subscription;

  ngOnInit() {
    console.log(this.form);
    this.sub = this.form.valueChanges.subscribe(a => console.log(a)); // TODO REMOVE THAT
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  masterToggle(event: MatCheckboxChange) {
    
  }

  toggleCookie(event: MatSlideToggleChange) {
    this.form.get(event.source.name as 'cascade8' | 'google' | 'intercom' | 'yandex').setValue(event.checked);
  }
}
