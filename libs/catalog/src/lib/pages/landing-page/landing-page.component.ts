import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { ContextMenuService } from '@blockframes/ui';
import { CONTEXT_MENU } from '@blockframes/utils/routes/context-menu/catalog-marketplace';

@Component({
  selector: 'catalog-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CatalogLandingPageComponent implements OnInit {
  constructor(private contextMenuService: ContextMenuService){}

  ngOnInit() {
    this.contextMenuService.setMenu(CONTEXT_MENU);
  }
}
