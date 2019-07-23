import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { FeedbackMessage } from '@blockframes/ui';

@Component({
  selector: 'organization-feedback',
  templateUrl: './organization-feedback.component.html',
  styleUrls: ['./organization-feedback.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationFeedbackComponent {
  public message: FeedbackMessage = {
    headline: 'Congratulation !',
    subline: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec luctus dictum metus quis sagittis. Duis a auctor nulla, a finibus mauris. Nullam eu maximus lorem.'
  };

  constructor(private router: Router) {}

  public navigate() {
    this.router.navigate(['../../layout']);
  }
}
