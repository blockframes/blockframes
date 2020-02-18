import { tap, distinctUntilChanged, debounceTime } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { FormControl } from '@angular/forms';
import { DistributionDealForm } from '@blockframes/movie/distribution-deals/form/distribution-deal.form';
import { Component, OnInit, ChangeDetectionStrategy, Input, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { DistributionDealTermsForm } from '../terms/terms.form';

@Component({
  selector: '[form] distribution-form-broadcast',
  templateUrl: './broadcast.component.html',
  styleUrls: ['./broadcast.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DistributionDealBroadcastComponent implements OnInit, OnDestroy {
  @Input() form: DistributionDealForm;

  public diffusionCtrl = new FormControl();

  private sub: Subscription

  constructor(private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.sub = this.diffusionCtrl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(value => {
        let index = 0
        // Reset controls by every state change
        this.diffusion.controls = [new DistributionDealTermsForm()];
        while (index < value -1) {
          this.diffusion.add();
          index++;
        }
        this.cdr.markForCheck();
      })
    ).subscribe()
  }

  get diffusion() {
    return this.form.get('multidiffusion')
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
