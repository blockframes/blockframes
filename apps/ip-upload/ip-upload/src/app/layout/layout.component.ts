import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
// tslint:disable-next-line
import { AuthQuery, User } from '@blockframes/auth';
import { Observable } from 'rxjs';

@Component({
  selector: 'ip-upload-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LayoutComponent implements OnInit {
  public user$: Observable<User>;

  constructor(private auth: AuthQuery, private router: Router) {}

  async ngOnInit() {
    this.user$ = this.auth.user$();
  }
}
