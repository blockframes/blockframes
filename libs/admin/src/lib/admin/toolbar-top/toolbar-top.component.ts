import { Component, ChangeDetectionStrategy } from '@angular/core';
import { App, Module, applicationUrl } from '@blockframes/utils/apps';

@Component({
  selector: 'admin-toolbar-top',
  templateUrl: './toolbar-top.component.html',
  styleUrls: ['./toolbar-top.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToolbarTopComponent {

  public goToApp(app: App, module: Module) {
    return `${applicationUrl[app]}/c/o/${module}`;
  }
}
