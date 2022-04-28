import { Component, ChangeDetectionStrategy, Inject } from '@angular/core';
import { App } from '@blockframes/model';
import { APP } from '@blockframes/utils/routes/utils';
import { ModuleGuard } from '@blockframes/utils/routes/module.guard';

@Component({
  selector: 'bf-footer',
  templateUrl: 'footer.component.html',
  styleUrls: ['./footer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FooterComponent {
  public module = this.moduleGuard.currentModule || 'marketplace';
  public currentYear = new Date().getFullYear();

  constructor(
    private moduleGuard: ModuleGuard,
    @Inject(APP) public app: App
  ) { }

}
