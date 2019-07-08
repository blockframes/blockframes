
import { Component, ChangeDetectionStrategy, OnInit, Output, EventEmitter } from '@angular/core';
import { AuthQuery, User } from '@blockframes/auth';
import { Observable } from 'rxjs';

@Component({
  selector: 'account-profile-view',
  templateUrl: './profile-view.component.html',
  styleUrls: ['./profile-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileViewComponent implements OnInit {

  user$: Observable<User>;
  @Output() edited = new EventEmitter();

  constructor(public query: AuthQuery){}

  ngOnInit() {
    this.user$ = this.query.user$;
  }
}
