import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { AuthQuery } from '@blockframes/auth';
import { Observable } from 'rxjs';

@Component({
// tslint:disable-next-line: component-selector
  selector: 'movie-financing-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit {

  isLogged$: Observable<boolean>;

  constructor(private auth: AuthQuery) {}

  ngOnInit() {
    this.isLogged$ = this.auth.isLogged$;
  }
}

