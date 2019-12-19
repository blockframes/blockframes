import { Component, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { RequestDemoRole } from '../../demo-request.model';

@Component({
  selector: 'catalog-learn-more',
  templateUrl: './learn-more.component.html',
  styleUrls: ['./learn-more.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CatalogLearnMoreComponent {
  @Output() sendRequest = new EventEmitter<FormGroup>();

  public form = new FormGroup({
    firstName: new FormControl(),
    lastName: new FormControl(),
    email: new FormControl(),
    phoneNumber: new FormControl(),
    companyName: new FormControl(),
    role: new FormControl()
  });

  public roles: RequestDemoRole[] = [
    RequestDemoRole.buyer,
    RequestDemoRole.seller,
    RequestDemoRole.other
  ];

}
