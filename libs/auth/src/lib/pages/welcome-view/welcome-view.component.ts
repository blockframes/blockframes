import { Component, ChangeDetectionStrategy, HostBinding } from '@angular/core';

@Component({
  selector: 'auth-welcome-view',
  templateUrl: './welcome-view.component.html',
  styleUrls: ['./welcome-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush

})

export class WelcomeViewComponent {
  @HostBinding('attr.page-id') pageId = 'welcome-view';
}
