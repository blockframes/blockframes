import { Component, OnInit, ChangeDetectionStrategy, Input, ChangeDetectorRef } from '@angular/core';
import { Contract } from '@blockframes/contract/contract/+state/contract.model';
import { ContractService } from '@blockframes/contract/contract/+state';

@Component({
  selector: 'admin-contract-tree',
  templateUrl: './contract-tree.component.html',
  styleUrls: ['./contract-tree.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContractTreeComponent implements OnInit {
  @Input() contract: Contract;
  public tree: any = {};
  public loaded = false;

  constructor(
    private contractService: ContractService,
    private cdRef: ChangeDetectorRef,
  ) { }

  async ngOnInit() {
    await this.recursiveParentsAndChilds(this.contract);
    this.loaded = true;
    this.cdRef.markForCheck();
  }

  /**
   * 
   * @param contract 
   * @param mode 
   *   0 check both parents and childs
   *   1 check only parents
   *   -1 check only childs
   *   99 build complete tree
   * @param level 
   */
  private async recursiveParentsAndChilds(contract: Contract, mode: 0 | 1 | -1 = 0, level: number = 0) {
    const processed = this.tree[contract.id] ? true : false;
    if (!processed) {
      this.tree[contract.id] = {
        id: contract.id,
        contract,
        level,
        parents: contract.parentContractIds,
        childs: contract.childContractIds,
      };

      if ([0, 1].includes(mode)) {
        for (const parentId of contract.parentContractIds) {
          const parentContract = await this.contractService.getValue(parentId);
          await this.recursiveParentsAndChilds(parentContract, 1, level + 1);
        };
      }

      if ([0, -1].includes(mode)) {
        for (const childId of contract.childContractIds) {
          const childContract = await this.contractService.getValue(childId);
          await this.recursiveParentsAndChilds(childContract, -1, level - 1);
        };
      }
    }
  }

  public getContractPath(contractId: string) {
    return `/c/o/admin/panel/contract/${contractId}`;
  }

  public getItems(parentId?: string) {
    const startLevel = Math.max.apply(Math, Object.keys(this.tree).map(contractId => this.tree[contractId].level));
    return Object.keys(this.tree).map(k => this.tree[k]).filter(c => parentId ? c.parents.includes(parentId) : c.level === startLevel);
  }
}
