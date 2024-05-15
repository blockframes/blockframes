import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { Right, RightType } from '@blockframes/model';
import { HorizontalNode, Node, VerticalNode } from '../components/graph/layout';

@Pipe({ name: 'isHorizontal' })
export class IsHorizontalPipe implements PipeTransform {
  transform(type: RightType) {
    return type === 'horizontal';
  }
}

@Pipe({ name: 'isStep' })
export class IsStepPipe implements PipeTransform {
  transform(id: string, rights: Right[]) {
    const groupId = rights.find(r => r.id === id)?.groupId;
    return rights.find(r => r.id === groupId)?.type === 'vertical';
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
  declarations: [IsHorizontalPipe, IsStepPipe, CanAddPipe],
  exports: [IsHorizontalPipe, IsStepPipe, CanAddPipe],
})
export class GraphNodePipeModule { }