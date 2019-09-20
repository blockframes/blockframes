import { ChangeDetectionStrategy, OnInit, Component } from '@angular/core';
import { ContextMenuService } from '@blockframes/ui';
import { CONTEXT_MENU } from './context-menu';
import { RouterOutlet } from '@angular/router';
import { slideAnimation } from '@blockframes/utils';

@Component({
  selector: 'delivery-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    slideAnimation
    // animation triggers go here
  ]
})

export class LayoutComponent implements OnInit {

  constructor(
    private contextMenuService: ContextMenuService,
  ) {}

  ngOnInit() {
    this.contextMenuService.setMenu(CONTEXT_MENU);
  }

  prepareRoute(outlet: RouterOutlet) {
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData['animation'];
  }
}
