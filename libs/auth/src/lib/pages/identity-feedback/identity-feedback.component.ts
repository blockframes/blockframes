import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'auth-identity-feedback',
  templateUrl: './identity-feedback.component.html',
  styleUrls: ['./identity-feedback.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IdentityFeedbackComponent {
  constructor(private router: Router) {}

  public navigate() {
    this.router.navigate(['/c']);
  }
}
