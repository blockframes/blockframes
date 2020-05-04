import { Component, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { RequestDemoRole } from '@blockframes/utils/request-demo';

@Component({
  selector: 'landing-learn-more',
  templateUrl: './learn-more.component.html',
  styleUrls: ['./learn-more.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LandingLearnMoreComponent {
  @Output() sendRequest = new EventEmitter<FormGroup>();

  public form = new FormGroup({
    firstName: new FormControl(),
    lastName: new FormControl(),
    email: new FormControl('', Validators.email),
    phoneNumber: new FormControl(),
    companyName: new FormControl(),
    role: new FormControl()
  });

  public roles: RequestDemoRole[] = [
    'buyer',
    'seller',
    'other'
  ];

  get phoneNumber(){
    return this.form.get('phoneNumber');
  }
}
