import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { BucketQuery, BucketService } from '@blockframes/contract/bucket/+state';

@Component({
  selector: 'catalog-specific-terms',
  templateUrl: 'specific-terms.component.html',
  styleUrls: ['./specific-terms.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpecificTermsComponent {
  
  form: FormGroup;

  constructor(
    private bucketQuery: BucketQuery,
    private bucketService: BucketService,
    private dialog: MatDialogRef<SpecificTermsComponent>,
    private router: Router
  ) {
    const bucket = this.bucketQuery.getActive();
    this.form = new FormGroup({
      specificity: new FormControl(bucket.specificity),
      delivery: new FormControl(bucket.delivery),
    })
  }

  createOffer() {
    const { specificity, delivery } = this.form.value;
    this.bucketService.createOffer(specificity, delivery);
    this.router.navigate(['/c/o/marketplace/selection/congratulations']);
    this.dialog.close();
  }
}