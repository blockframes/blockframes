import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { ContextMenuService } from '@blockframes/ui';
import { CONTEXT_MENU, CONTEXT_MENU_AFM } from './context-menu';
import { AFM_DISABLE } from '@env';
import { Observable } from 'rxjs';
import { Wishlist, WishlistStatus } from '@blockframes/organization';
import { map } from 'rxjs/operators';
import { BasketQuery } from '../distribution-right/+state/basket.query';
import { AuthService } from '@blockframes/auth';

@Component({
  selector: 'catalog-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class LayoutComponent implements OnInit {
  public AFM_DISABLE: boolean;
  public currentWishlist$: Observable<Wishlist>

  constructor(
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

    this.currentWishlist$ = this.basketQuery.wishlistWithMovies$.pipe(
      map(wishlist => wishlist.find(wish => wish.status === WishlistStatus.pending))
    );
  }

  public async logout() {
    await this.service.logout();
    // TODO: issue#879, navigate with router
    window.location.reload();
  }
}
