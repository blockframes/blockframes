import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { BucketService } from '@blockframes/contract/bucket/+state';
import { MovieCurrency } from '@blockframes/utils/static-model';

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
    acceptTerms: new FormControl(false)
  });

  constructor(
    private bucketService: BucketService,
    private dialog: MatDialogRef<SpecificTermsComponent>,
    private router: Router,
    @Inject(MAT_DIALOG_DATA) public data: { currency: MovieCurrency }
  ) { }

  async ngOnInit() {
    const { specificity = '', delivery = '' } = await this.bucketService.getActive();
    this.form.setValue({ specificity, delivery, acceptTerms:false });
  }

  async createOffer() {
    try {
      this.form.disable();
      const { specificity, delivery } = this.form.value;
      await this.bucketService.createOffer(specificity, delivery, this.data.currency ?? 'EUR');
      this.router.navigate(['/c/o/marketplace/selection/congratulations']);
      this.dialog.close();
    } catch (err) {
      this.form.enable();
      console.error(err);
    }
  }
}
