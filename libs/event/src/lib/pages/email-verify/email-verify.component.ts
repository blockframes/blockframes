import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthStore } from '@blockframes/auth/+state';

@Component({
  selector: 'event-email-verify',
  templateUrl: './email-verify.component.html',
  styleUrls: ['./email-verify.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmailVerifyComponent implements OnInit {

  private invitationId : string;
  constructor(
    private authStore: AuthStore,
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    const { i, code } = this.route.snapshot.queryParams;
    this.invitationId = i;
    console.log(i,code);
    // @TODO #6756
    // listen of invitation to compare if with code in params
    // if equal :
    // Update store with from value
    // this.authStore.updateAnonymousCredentials({ emailVerified: true });
    // Redirect user to event view
    // this.router.navigate(['../i'], { relativeTo: this.route, queryParams: this.route.snapshot.queryParams });
  }

  click() {
    // @TODO #6756 call backendfunction with this.invitationId and email => send mail
    
    
    
  }
}
