
import { Component, ChangeDetectionStrategy, Output, EventEmitter, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { Organization } from '@blockframes/organization';
import { Profile } from '../../forms/profile-edit.form';

@Component({
  selector: 'account-profile-display',
  templateUrl: './profile-display.component.html',
  styleUrls: ['./profile-display.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileDisplayComponent {
  public email: string;
  @Output() editing = new EventEmitter<string>();
  @Input() user$: Observable<Profile>;
  @Input() userEmail: string;
  @Input() organization$: Observable<Organization>;
}
