import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationService } from '../+state';

@Component({
  selector: 'blockframes-notification-item',
  templateUrl: './notification-item.component.html',
  styleUrls: ['./notification-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationItemComponent {

  @Input() notification : any;

  constructor(private router: Router, private service: NotificationService) { }

  public goToPath() {
    // re-enable navigation when store is set with guard
    // this.router.navigate([this.notification.path]);
    this.service.readNotification(this.notification.id);
  }

  public read() {
    this.service.readNotification(this.notification.id);
  }
}
