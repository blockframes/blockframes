import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
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
export class SpecificTermsComponent implements OnInit {
  
  form = new FormGroup({
    specificity: new FormControl(),
    delivery: new FormControl(),
  })

  constructor(
    private bucketService: BucketService,
    private dialog: MatDialogRef<SpecificTermsComponent>,
    private router: Router
  ) {}

  async ngOnInit() {
   const { specificity = "", delivery = "" } = await this.bucketService.getActive();
   this.form.setValue({ specificity, delivery });
  }

  createOffer() {
    const { specificity, delivery } = this.form.value;
    this.bucketService.createOffer(specificity, delivery);
    this.router.navigate(['/c/o/marketplace/selection/congratulations']);
    this.dialog.close();
  }
}