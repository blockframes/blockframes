
import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { AuthQuery, AuthService, User } from '@blockframes/auth';
import { createProfile } from '../forms/profile-edit.form';
import { ThemeService } from '@blockframes/ui/theme';

@Component({
  selector: 'account-profile-menu',
  templateUrl: './profile-menu.component.html',
  styleUrls: ['./profile-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileMenuComponent implements OnInit{
  public user$: Observable<User>;
  public theme: string;
  private sub = new Subscription();

  constructor(
    private service: AuthService,
    private auth: AuthQuery,
    private themeService: ThemeService,
  ){}

  ngOnInit(){
    this.user$ = this.auth.user$;
    this.sub = this.themeService.theme$.subscribe(theme => this.theme = theme)
  }

  public async logout() {
    await this.service.signOut();
    // TODO: issue#879, navigate with router
    window.location.reload();
  }

  public get profile() {
    return createProfile(this.auth.user)
  }

  public get placeholderUrl() {
    return `/assets/images/${this.theme}/Avatar_40.png`;
  }
}
