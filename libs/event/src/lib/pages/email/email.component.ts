import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthStore } from '@blockframes/auth/+state';

@Component({
  selector: 'event-email',
  templateUrl: './email.component.html',
  styleUrls: ['./email.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmailComponent implements OnInit {

  constructor(
    private authStore: AuthStore,
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    const { email } = this.route.snapshot.queryParams;
    // @TODO #6756
    console.log(`populate form with email ${email}`);
  }

  click() {
    // Update store with from value
    this.authStore.updateAnonymousCredentials({ lastName: 'bruce', firstName: 'test', email: 'foo@bar.com'});
    // Redirect user to event view
    this.router.navigate(['../i'], { relativeTo: this.route, queryParams: this.route.snapshot.queryParams });
  }

}
