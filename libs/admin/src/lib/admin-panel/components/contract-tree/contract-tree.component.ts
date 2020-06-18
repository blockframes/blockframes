import { Component, OnInit, ChangeDetectionStrategy, Input, ChangeDetectorRef } from '@angular/core';
import { Contract } from '@blockframes/contract/contract/+state/contract.model';
import { ContractService } from '@blockframes/contract/contract/+state';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { NestedTreeControl } from '@angular/cdk/tree';

interface ContractNode {
  id: string,
  contract: Contract,
  level: number,
  parents: [],
  childs: [],
}

@Component({
  selector: 'admin-contract-tree',
  templateUrl: './contract-tree.component.html',
  styleUrls: ['./contract-tree.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContractTreeComponent implements OnInit {
  @Input() contract: Contract;
  private tree: any = {};
  public loaded = false;
  public treeControl = new NestedTreeControl<ContractNode>(node => this.getItems(node.id));
  public dataSource = new MatTreeNestedDataSource<ContractNode>();

  constructor(
    private contractService: ContractService,
    private cdRef: ChangeDetectorRef,
    private snackBar: MatSnackBar,
  ) { }

  hasChild = (_: number, node: ContractNode) => !!node.childs && node.childs.length > 0;

  async ngOnInit() {
    await this.recursiveParentsAndChilds(this.contract);
    this.dataSource.data = this.getItems();
    this.loaded = true;
    this.cdRef.markForCheck();
  }

  /**
   * 
   * @param contract 
   * @param mode 
   *   0 check both parents and childs
   *   -1 check only childs (descending mode)
   * @param level 
   */
  private async recursiveParentsAndChilds(contract: Contract, mode: 0 | -1 = 0, level: number = 0) {
    const processed = this.tree[contract.id] ? true : false;
    if (!processed) {
      this.tree[contract.id] = {
        id: contract.id,
        contract,
        level,
        parents: contract.parentContractIds || [],
        childs: contract.childContractIds || [],
      };

      // If 0 : we fetch parents & childs.
      if (mode === 0) {
        const promises = this.tree[contract.id].parents.map(async (parentId: string) => {
          const parentContract = await this.contractService.getValue(parentId);
          if (parentContract) {
            return this.recursiveParentsAndChilds(parentContract, 0, level + 1);
          } else {
            this.snackBar.open(`Parent contract ${parentId} not found.`, 'close', { duration: 2000 });
          }
        });
        await Promise.all(promises);
      }

      // If 0 : we fetch parents & childs. If -1 (descending mode), we check only childrens
      if ([0, -1].includes(mode)) {
        const promises = this.tree[contract.id].childs.map(async (childId: string) => {
          const childContract = await this.contractService.getValue(childId);
          if (childContract) {
            return this.recursiveParentsAndChilds(childContract, -1, level - 1);
          } else {
            this.snackBar.open(`Child contract ${childId} not found.`, 'close', { duration: 2000 });
          }
        });
        await Promise.all(promises);
      }
    }
  }

  /**
   * Retreive contracts that are directly child of parentId
   * If parentId not specified, we start from the root (highest) level contract
   * @param parentId 
   */
  private getItems(parentId?: string) {
    const contracts = Object.keys(this.tree).map(contractId => this.tree[contractId]);
    const startLevel = Math.max(...contracts.map(c => c.level));
    return contracts.filter(c => parentId ? c.parents.includes(parentId) : c.level === startLevel);
  }
}
