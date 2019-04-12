import { Component, ChangeDetectionStrategy, OnInit, HostListener } from '@angular/core';
import { ContextMenuService } from '@blockframes/ui';
import { CONTEXT_MENU } from './context-menu';
import { CloseProtection } from 'libs/auth/src/lib/guard/close-protection';
import { AuthQuery } from '@blockframes/auth';

@Component({
  selector: 'financing-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayoutComponent implements OnInit, CloseProtection {

  constructor(private contextMenuService: ContextMenuService, private authQuery: AuthQuery) {}

  ngOnInit() {
    this.contextMenuService.setMenu(CONTEXT_MENU);
  }
  
  isFlaged(): boolean {
    return !this.authQuery.getValue().isKeyStored;
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any) {
    if (this.isFlaged()) {
      $event.returnValue = 'The account creation process has not ended yet. If you leave now you will lose critical data forever !';
    }
  }

}
