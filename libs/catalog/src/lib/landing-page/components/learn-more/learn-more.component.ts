import { Component, Output, EventEmitter, OnDestroy } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { RequestDemoRole } from '../../demo-request.model';

@Component({
  selector: 'catalog-learn-more',
  templateUrl: './learn-more.component.html',
  styleUrls: ['./learn-more.component.scss']
})
export class CatalogLearnMoreComponent implements OnDestroy {
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
  private subscription: Subscription;

  constructor(router: Router) {
    /** Enables the "jump to" behavior on this component. */
    this.subscription = router.events.subscribe(s => {
      if (s instanceof NavigationEnd) {
        const tree = router.parseUrl(router.url);
        if (tree.fragment) {
          const element = document.querySelector('#' + tree.fragment);
          if (element) {
            element.scrollIntoView(true);
          }
        }
      }
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
