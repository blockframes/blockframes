import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ControlContainer, FormControl } from '@angular/forms';
import { default as staticModels, SlugAndLabel } from '@blockframes/utils/static-model/staticModels';
import { MovieSalesAgentDealForm } from './sales-agent-deal.form';
import { Observable } from 'rxjs';
import { startWith, debounceTime, map, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: '[formGroup] movie-form-salesdeal, [formGroupName] movie-form-salesdeal',
  templateUrl: './sales-agent-deal.component.html',
  styleUrls: ['./sales-agent-deal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieFormSalesAgentDealComponent implements OnInit {

  public staticModels: any;
  public territoriesFilterCtrl = new FormControl();
  public mediasFilterCtrl = new FormControl();
  public territories$: Observable<SlugAndLabel[]>;
  public medias$: Observable<SlugAndLabel[]>;

  constructor(public controlContainer: ControlContainer) { }

  ngOnInit() {
    this.staticModels = staticModels;
    this.territories$ = this.filterSelectSearch(this.territoriesFilterCtrl, this.staticModels['TERRITORIES']);
    this.medias$ = this.filterSelectSearch(this.mediasFilterCtrl, this.staticModels['MEDIAS']);
  }

  get salesAgentDeal() : MovieSalesAgentDealForm {
    return this.controlContainer.control as MovieSalesAgentDealForm;
  }

  private filterSelectSearch(control: FormControl, model: SlugAndLabel[]) {
    return control.valueChanges.pipe(
      startWith(''),
      debounceTime(200),
      distinctUntilChanged(),
      map(name => model.filter(item => item.label.toLowerCase().indexOf(name.toLowerCase()) > -1))
    );
  }


}
