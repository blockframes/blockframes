import { Component, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'catalog-learn-more',
  templateUrl: './learn-more.component.html',
  styleUrls: ['./learn-more.component.scss']
})
export class CatalogLearnMoreComponent {
  @Output() sendRequest = new EventEmitter<FormGroup>();

  public form = new FormGroup({
    firstName: new FormControl(),
    lastName: new FormControl(),
    companyName: new FormControl(),
    role: new FormControl(),
  });

  public roles: string [] = ['Buyer', 'Seller', 'Other']
}
