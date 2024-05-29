import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { Router } from '@angular/router';
import { BucketService } from '@blockframes/contract/bucket/service';
import { MovieCurrency } from '@blockframes/model';

@Component({
  selector: 'catalog-specific-terms',
  templateUrl: 'specific-terms.component.html',
  styleUrls: ['./specific-terms.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpecificTermsComponent implements OnInit {

  form = new UntypedFormGroup({
    specificity: new UntypedFormControl(),
    acceptTerms: new UntypedFormControl(false)
  });

  constructor(
    private bucketService: BucketService,
    private dialog: MatDialogRef<SpecificTermsComponent>,
    private router: Router,
    @Inject(MAT_DIALOG_DATA) public data: { currency: MovieCurrency }
  ) { }

  async ngOnInit() {
    const { specificity = '' } = await this.bucketService.getActive();
    this.form.setValue({ specificity, acceptTerms: false });
  }
  async createOffer() {
    try {
      this.form.disable();
      const { specificity } = this.form.value;
      await this.bucketService.createOffer(specificity, this.data.currency ?? 'EUR');
      this.router.navigate(['/c/o/marketplace/selection/congratulations']);
      this.dialog.close();
    } catch (err) {
      this.form.enable();
      console.error(err);
    }
  }
}
