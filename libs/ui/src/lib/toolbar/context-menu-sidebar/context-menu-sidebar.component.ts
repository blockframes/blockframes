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
    this.nextRoute$ = this.router.events.pipe(filter(event => event instanceof NavigationEnd));
  }

  isActive(path: string, exact: boolean, nextRoute: NavigationEnd): boolean {

   if(nextRoute instanceof NavigationEnd) {
      // test if path match with next route
      // (ie: when user clicked on nav bar link)
      if(exact && nextRoute.url === path){
        return true;
      } else if(!exact && nextRoute.url.indexOf(path) === 0){
        return true;
      }
    }

    // if nothing above returned true, we test current route
    // (ie: used only on first page load)
    return this.router.isActive(this.router.createUrlTree([path]), exact);
  }

}
