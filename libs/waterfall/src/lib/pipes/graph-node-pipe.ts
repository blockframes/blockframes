import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { RightType } from '@blockframes/model';
import { HorizontalNode, Node, VerticalNode } from '../components/graph/layout';

@Pipe({ name: 'isHorizontal' })
export class IsHorizontalPipe implements PipeTransform {
  transform(type: RightType) {
    return type === 'horizontal';
  }
}

@Pipe({ name: 'canAddChild' })
export class CanAddPipe implements PipeTransform {
  transform(node: Node, group?: VerticalNode | HorizontalNode, nonEditableNodeIds?: string[]) {
    if (!node) return false;
    if (node.children.length > 1 || group?.children.length > 1) return false;
    if (nonEditableNodeIds?.includes(node.id)) return false;
    if (group && nonEditableNodeIds?.includes(group.id)) return false;
    if (node.children.some(childId => nonEditableNodeIds?.includes(childId))) return false;
    if (group && group.children.some(childId => nonEditableNodeIds?.includes(childId))) return false;
    return true;
  }
}

@NgModule({
  declarations: [IsHorizontalPipe, CanAddPipe],
  exports: [IsHorizontalPipe, CanAddPipe],
})
export class GraphNodePipeModule { }