import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthStore } from '@blockframes/auth/+state';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'event-identity',
  templateUrl: './identity.component.html',
  styleUrls: ['./identity.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventIdenityComponent implements OnInit {

  public identityForm = new FormGroup({
    firstname: new FormControl('', [Validators.required]),
    lastname: new FormControl('', [Validators.required])
  });
  public eventId: string;

  constructor(
    private authStore: AuthStore,
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.eventId = this.route.snapshot.params.eventId;
  }

  validateIdentity() {
    // Update store with from value
    this.authStore.updateAnonymousCredentials({
      lastName: this.identityForm.value.lastName,
      firstName: this.identityForm.value.firstname
    });
    // Redirect user to event view
    this.router.navigate(['../i'], { relativeTo: this.route, queryParams: this.route.snapshot.queryParams });
  }
}
