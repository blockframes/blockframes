import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ContextMenuQuery} from '../+state/context-menu.query'
import { Router, NavigationEnd, Event } from '@angular/router';
import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'context-menu-sidebar',
  templateUrl: './context-menu-sidebar.component.html',
  styleUrls: ['./context-menu-sidebar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContextMenuSidebarComponent implements OnInit {
  public items$: Observable<any>;
  public nextRoute$: Observable<Event>;

  constructor(
    private query: ContextMenuQuery,
    private router: Router,
  ) {}

  ngOnInit() {
    this.items$ = this.query.menu$;
  }
}
