import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { ContextMenuService } from '@blockframes/ui';
import { CONTEXT_MENU, CONTEXT_MENU_AFM } from './context-menu';
import { AFM_DISABLE } from '@env';
import { Observable } from 'rxjs';
import { Wishlist, WishlistStatus } from '@blockframes/organization';
import { map } from 'rxjs/operators';
import { BasketQuery } from '../distribution-right/+state/basket.query';

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
    private basketQuery: BasketQuery
  ) {
    this.AFM_DISABLE = AFM_DISABLE;
   }

  ngOnInit() {
    if (!this.AFM_DISABLE) {
      this.contextMenuService.setMenu(CONTEXT_MENU_AFM);
    } else {
      this.contextMenuService.setMenu(CONTEXT_MENU);
    }

    this.currentWishlist$ = this.basketQuery.wishlistsWithMovies$.pipe(
      map(wishlists => wishlists.find(wishlist => wishlist.status === WishlistStatus.pending))
    );
  }
}
