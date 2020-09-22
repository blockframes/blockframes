import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'workspace'
})
export class Workspace implements PipeTransform {
  transform({ appAccess }, app: string) {
    return appAccess[app]?.dashboard ? 'dashboard' : 'marketplace';
  }
}

@NgModule({
  declarations: [Workspace],
  imports: [CommonModule],
  exports: [Workspace]
})
export class WorkspacePipeModule { }
