import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { distributionRightStatus } from '@blockframes/distribution-rights/+state/distribution-right.firestore';
import { RightAdminForm } from '../../forms/right-admin.form';
import { Contract } from '@blockframes/contract/contract/+state/contract.model';
import { ContractService } from '@blockframes/contract/contract/+state';
import { DistributionRight } from '@blockframes/distribution-rights/+state/distribution-right.model';
import { DistributionRightService } from '@blockframes/distribution-rights/+state/distribution-right.service';


@Component({
  selector: 'admin-distribution-right',
  templateUrl: './distribution-right.component.html',
  styleUrls: ['./distribution-right.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DistributionRightComponent implements OnInit {
  public rightId = '';
  public movieId = '';
  public right: DistributionRight;
  public rightForm: RightAdminForm;
  public distributionRightStatus = distributionRightStatus;
  public contract: Contract;

  constructor(
    private distributionRightService: DistributionRightService,
    private contractService: ContractService,
    private route: ActivatedRoute,
    private cdRef: ChangeDetectorRef,
    private snackBar: MatSnackBar
  ) { }

  async ngOnInit() {
    this.rightId = this.route.snapshot.paramMap.get('rightId');
    this.movieId = this.route.snapshot.paramMap.get('movieId');
    try {
      this.right = await this.distributionRightService.getValue(this.rightId, { params: { movieId: this.movieId } });
      this.rightForm = new RightAdminForm(this.right);

      if (this.right.contractId) {
        this.contract = await this.contractService.getValue(this.right.contractId);
      }

    } catch (error) {
      this.snackBar.open('There was an error while oppening right', 'close', { duration: 5000 });
    }
    this.cdRef.markForCheck();
  }

  public async update() {
    if (this.rightForm.invalid) {
      this.snackBar.open('Information not valid', 'close', { duration: 5000 });
      return;
    }

    const update = {
      contractId: this.rightForm.get('contractId').value,
      status: this.rightForm.get('status').value,
      exclusive: this.rightForm.get('exclusive').value,
    }

    await this.distributionRightService.update(this.rightId, update, { params: { movieId: this.movieId } });

    this.snackBar.open('Informations updated !', 'close', { duration: 5000 });
  }

}
