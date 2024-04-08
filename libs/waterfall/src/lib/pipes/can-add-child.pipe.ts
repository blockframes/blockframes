import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { HorizontalNode, RightNode, VerticalNode } from '../components/graph/layout';

@Pipe({ name: 'canAddChild' })
export class CanAddPipe implements PipeTransform {
  transform(right: RightNode | VerticalNode, group?: VerticalNode | HorizontalNode) {
    if (right.children.length > 1 || group?.children.length > 1) return false;
    return true;
  }
}

@NgModule({
  declarations: [CanAddPipe],
  exports: [CanAddPipe],
})
export class CanAddChildPipeModule { }
