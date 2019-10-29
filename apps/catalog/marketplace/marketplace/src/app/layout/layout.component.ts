import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { ContextMenuService } from '@blockframes/ui';
import { CONTEXT_MENU, CONTEXT_MENU_AFM } from './context-menu';
import { AFM_DISABLE } from '@env';

@Component({
  selector: 'catalog-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class LayoutComponent implements OnInit {
  public AFM_DISABLE: boolean;

  constructor(
    private contextMenuService: ContextMenuService,
  ) {
    this.AFM_DISABLE = AFM_DISABLE;
   }

  ngOnInit() {
    if (!this.AFM_DISABLE) {
      this.contextMenuService.setMenu(CONTEXT_MENU_AFM);
    } else {
      this.contextMenuService.setMenu(CONTEXT_MENU);
    }
  }
}
