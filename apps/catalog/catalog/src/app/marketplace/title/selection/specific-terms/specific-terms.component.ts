import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { BucketService } from '@blockframes/contract/bucket/+state';

@Component({
  selector: 'catalog-specific-terms',
  templateUrl: 'specific-terms.component.html',
  styleUrls: ['./specific-terms.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpecificTermsComponent {
  
  form = new FormGroup({
    specificity: new FormControl(''),
    delivery: new FormControl('')
  })

  constructor(
    private bucketService: BucketService,
    private dialog: MatDialogRef<SpecificTermsComponent>,
    private router: Router
  ) { }

  createOffer() {
    this.bucketService.createOffer(this.form.value);
    this.router.navigate(['/c/o/marketplace/selection/congratulations']);
    this.dialog.close();
  }
}