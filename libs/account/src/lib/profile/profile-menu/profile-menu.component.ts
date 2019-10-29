
import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthQuery, AuthService, User } from '@blockframes/auth';
import { createProfile } from '../forms/profile-edit.form';

@Component({
  selector: 'account-profile-menu',
  templateUrl: './profile-menu.component.html',
  styleUrls: ['./profile-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileMenuComponent implements OnInit{
  public user$: Observable<User>;
  public placeholderUrl = '/assets/logo/profil_avatar_250.svg';

  constructor(
    private service: AuthService,
    private auth: AuthQuery,
  ){}

  ngOnInit(){
    this.user$ = this.auth.user$;
  }

  public async logout() {
    await this.service.logout();
    // TODO: issue#879, navigate with router
    window.location.reload();
  }

  public get profile() {
    return createProfile(this.auth.getValue().user)
  }
}
