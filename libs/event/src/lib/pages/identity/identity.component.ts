import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthStore } from '@blockframes/auth/+state';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EventQuery } from '@blockframes/event/+state';


@Component({
  selector: 'event-identity',
  templateUrl: './identity.component.html',
  styleUrls: ['./identity.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventIdenityComponent implements OnInit {
  public identityForm = new FormGroup({
    firstName: new FormControl('', [Validators.required]),
    lastName: new FormControl('', [Validators.required])
  });
  public eventId = this.eventQuery.getActiveId();

  constructor(
    private authStore: AuthStore,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private eventQuery: EventQuery,
  ) { }

  ngOnInit() {
    this.eventId = this.route.snapshot.params.eventId;
  }

  validateIdentity() {
    if (!this.identityForm.valid) {
      this.snackBar.open('Form invalid, please check error messages', 'close', { duration: 2000 });
      return;
    }
    // Update store with from value
    this.authStore.updateAnonymousCredentials({
      lastName: this.identityForm.value.lastName,
      firstName: this.identityForm.value.firstName
    });
    // Redirect user to event view
    this.router.navigate(['../i'], { relativeTo: this.route, queryParams: this.route.snapshot.queryParams });
  }
}
