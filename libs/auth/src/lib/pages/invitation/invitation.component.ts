import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService, AuthQuery } from '../../+state';
import { MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';

@Component({
  selector: 'auth-invitation',
  templateUrl: './invitation.component.html',
  styleUrls: ['./invitation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InvitationComponent {
  public form = new FormGroup({
    name: new FormControl('', Validators.minLength(3)),
    surname: new FormControl('', Validators.minLength(3))
  });

  constructor(
    private service: AuthService,
    private query: AuthQuery,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  public async update() {
    if (this.form.valid) {
      const uid = this.query.userId;
      try {
        await this.service.update(uid, this.form.value);
        this.router.navigate(['layout/congratulation']);
      } catch (error) {
        this.snackBar.open(error.message, 'close', { duration: 5000 });
      }
    } else {
      this.snackBar.open('Please enter valid name and surname', 'close', { duration: 2000 });
    }
  }
}
