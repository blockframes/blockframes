import { Component, ChangeDetectionStrategy, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { ContextMenuService } from '@blockframes/ui';
import { CONTEXT_MENU, CONTEXT_MENU_AFM } from './context-menu';
import { AFM_DISABLE } from '@env';
import { Observable } from 'rxjs';
import { Wishlist, WishlistStatus } from '@blockframes/organization';
import { map } from 'rxjs/operators';
import { BasketQuery } from '../distribution-right/+state/basket.query';
import { AuthService } from '@blockframes/auth';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { MatSidenav } from '@angular/material';

@Component({
  selector: 'catalog-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class LayoutComponent implements OnInit, AfterViewInit, OnDestroy {
  public AFM_DISABLE: boolean;
  public currentWishlist$: Observable<Wishlist>
  routerNavi;

  @ViewChild(MatSidenav, {static: false}) sidenav: MatSidenav;

  constructor(
    private router: RouterQuery,
    private contextMenuService: ContextMenuService,
    private basketQuery: BasketQuery,
    private service: AuthService
    ) {
      this.AFM_DISABLE = AFM_DISABLE;
    }

  ngOnInit() {
    this.contextMenuService.setMenu(CONTEXT_MENU);

    if (!this.AFM_DISABLE) {
      this.contextMenuService.setMenu(CONTEXT_MENU_AFM);
    } else {
      this.contextMenuService.setMenu(CONTEXT_MENU);
    }

    this.currentWishlist$ = this.basketQuery.wishlistsWithMovies$.pipe(
      map(wishlists => wishlists.find(wishlist => wishlist.status === WishlistStatus.pending))
      );
    }

    ngAfterViewInit() {
      this.routerNavi = this.router.select('navigationId');
      this.routerNavi.subscribe(() => {
        this.sidenav.close();
      });
    }

  public async logout() {
    await this.service.logout();
    // TODO: issue#879, navigate with router
    window.location.reload();
  }

  ngOnDestroy() {
    this.routerNavi.unsubscribe();
  }
}
