import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { RightNode, VerticalNode } from '../components/graph/layout';

@Pipe({ name: 'canAddChild' })
export class CanAddPipe implements PipeTransform {
  transform(right: RightNode | VerticalNode) {
    if (right.children.length > 1) return false;
    return true;
  }
}

@NgModule({
  declarations: [CanAddPipe],
  exports: [CanAddPipe],
})
export class CanAddChildPipeModule { }
