import { Component, OnInit, ChangeDetectionStrategy, Input, ChangeDetectorRef } from '@angular/core';
import { Contract } from '@blockframes/contract/contract/+state/contract.model';
import { ContractService } from '@blockframes/contract/contract/+state';
import { MatSnackBar } from '@angular/material';

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
    private snackBar: MatSnackBar,
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
   *   1 check only parents (ascending mode)
   *   -1 check only childs (descending mode)
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

      // If 0 : we fetch parents & childs. If 1 (ascending mode), we check only parents
      if ([0, 1].includes(mode)) {
        for (const parentId of contract.parentContractIds) {
          const parentContract = await this.contractService.getValue(parentId);
          if(parentContract) {
            await this.recursiveParentsAndChilds(parentContract, 1, level + 1);
          } else {
            this.snackBar.open(`Parent contract ${parentId} not found.`, 'close', { duration: 2000 });
          } 
         
        };
      }

      // If 0 : we fetch parents & childs. If -1 (descending mode), we check only childrens
      if ([0, -1].includes(mode)) {
        for (const childId of contract.childContractIds) {
          const childContract = await this.contractService.getValue(childId);
          if(childContract) {
            await this.recursiveParentsAndChilds(childContract, -1, level - 1);
          } else {
            this.snackBar.open(`Child contract ${childId} not found.`, 'close', { duration: 2000 });
          }
          
        };
      }
    }
  }

  public getContractPath(contractId: string) {
    return `/c/o/admin/panel/contract/${contractId}`;
  }

  public getContractTunnelPath(contract: Contract) {
    return `/c/o/marketplace/tunnel/contract/${contract.id}/${contract.type}`;
  }

  /**
   * Retreive contracts that are directly child of parentId
   * If parentId not specified, we start from the root (highest) level contract
   * @param parentId 
   */
  public getItems(parentId?: string) {
    const contracts = Object.keys(this.tree).map(contractId => this.tree[contractId]);
    const startLevel = Math.max(...contracts.map(c => c.level));
    return contracts.filter(c => parentId ? c.parents.includes(parentId) : c.level === startLevel);
  }
}
