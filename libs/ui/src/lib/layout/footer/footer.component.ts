// Angular
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { AppGuard } from '@blockframes/utils/routes/app.guard';
import { ModuleGuard } from '@blockframes/utils/routes/module.guard';

@Component({
  selector: 'bf-footer',
  templateUrl: 'footer.component.html',
  styleUrls: ['./footer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FooterComponent {
  public app = this.appGuard.currentApp;
  public module = this.moduleGuard.currentModule || 'marketplace';
  public currentYear = new Date().getFullYear();

  constructor(
    private appGuard: AppGuard, 
    private moduleGuard: ModuleGuard
  ) { }

}
