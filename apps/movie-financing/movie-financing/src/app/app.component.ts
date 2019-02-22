import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { User, AuthQuery } from '@blockframes/auth';

@Component({
  selector: 'blockframes-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit {
  public user$: Observable<User>;

  constructor(private auth: AuthQuery, private router: Router) {}

  async ngOnInit() {
    this.user$ = this.auth.select(state => state.user);
  }

  public logout() {
    this.router.navigate([''])
  }
}
