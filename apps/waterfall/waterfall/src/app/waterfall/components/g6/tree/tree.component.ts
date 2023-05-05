import { AfterViewInit, ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { TreeGraph, TreeGraphData } from '@antv/g6';
import { setupTreeGraph } from './../utils';
import { MatSnackBar } from '@angular/material/snack-bar';
import { sha1 } from 'object-hash';
import { Block, Version, Waterfall } from '@blockframes/waterfall/waterfall';
import { BlockService } from '@blockframes/waterfall/block.service';


interface TreeItem {
  hash: string,
  blockId: string,
  parentHash: string,
}

const genesisBlock = 'genesis';

function versionToTree(version: string[]) {
  const tree: Record<string, TreeItem> = {};
  for (let i = 0; i < version.length; i++) {
    const blockId = version[i];
    if (i === 0) {
      const item = { blockId, parentHash: genesisBlock };
      const hash = sha1(item);
      if (tree[hash]) continue;
      tree[hash] = { hash, ...item };
    } else {
      const parentId = version[i - 1];
      const parentItem = Object.values(tree).find(item => item.blockId === parentId);
      if (!parentItem) throw new Error(`Parent of ${blockId} not found`);
      const item = { blockId, parentHash: parentItem.hash };
      const hash = sha1(item);
      if (tree[hash]) continue;
      tree[hash] = { hash, ...item };
    }
  }
  return Object.values(tree);
}

function blocksToG6(blocks: Block[], versions: Version[]): TreeGraphData {
  const tree: TreeItem[] = [];

  for (const version of versions) {
    const subTree = versionToTree(version.blockIds);
    for (const i of subTree) {
      if (tree.find(item => item.hash === i.hash)) continue;
      tree.push(i);
    }
  }

  const childs = (parentHash: string, tree: TreeItem[]): TreeGraphData[] => tree
    .filter(item => item.parentHash === parentHash)
    .map(item => ({
      id: item.hash,
      label: blocks.find(block => block.id === item.blockId)?.name,
      children: childs(item.hash, tree)
    }))

  return { id: genesisBlock, label: 'Start', children: childs(genesisBlock, tree) };
}

@Component({
  selector: 'waterfall-g6-tree',
  templateUrl: './tree.component.html',
  styleUrls: ['./tree.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TreeComponent implements AfterViewInit {
  @Input() waterfall?: Waterfall;
  private blockTree?: TreeGraph;

  constructor(
    private blockService: BlockService,
    private snackbar: MatSnackBar,
  ) { }

  async ngAfterViewInit() {
    const container = document.getElementById('tree');
    const width = container?.scrollWidth || 500;
    const height = container?.scrollHeight || 500;
    this.blockTree = setupTreeGraph('tree', width, height);

    await this.buildBlockTree();
  }

  private async buildBlockTree() {
    if (!this.waterfall) {
      this.snackbar.open('Missing waterfall');
      return;
    }
    const blocks = await this.blockService.getValue({ waterfallId: this.waterfall.id });
    const data = blocksToG6(blocks, this.waterfall.versions);

    this.blockTree?.data(data);
    this.blockTree?.render();
    this.blockTree?.fitView();

    const container = document.getElementById('tree');
    if (typeof window !== 'undefined') {
      window.onresize = () => {
        if (!this.blockTree || this.blockTree?.get('destroyed')) return;
        if (!container || !container.scrollWidth || !container.scrollHeight) return;
        this.blockTree.changeSize(container.scrollWidth, container.scrollHeight);
      };
    }
  }

}
