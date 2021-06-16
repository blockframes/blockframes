import { Component, Input, Output, EventEmitter, TemplateRef } from '@angular/core';
import { Bucket } from '@blockframes/contract/bucket/+state/bucket.model';
import { Movie } from '@blockframes/movie/+state/movie.model';
import { Scope } from '@blockframes/utils/static-model';

@Component({
  selector: 'contract-item',
  templateUrl: './contrac-item.component.html',
  styleUrls: ['./contrac-item.component.css']
})
export class ContracItemComponent {

  @Input() bucket: Bucket;
  @Input() priceTemplate:TemplateRef<unknown>;
  @Input() colActionsTemplate:TemplateRef<unknown>;
  @Input() columns: Record<string, string>;
  @Input() initialColumns: string[];
  @Output() setPrice = new EventEmitter<{ index: number, price: number | string }>();
  @Output() updatePrice = new EventEmitter<{ index: number, price: string }>();
  @Output() openDetails = new EventEmitter<{ terms: string, scope: Scope }>();
  @Output() removeTerm = new EventEmitter<{ contractIndex: number, termIndex: number }>();
  @Output() removeContract = new EventEmitter<{ index: number, title: Movie }>();
  trackById = (i: number, doc: { id: string }) => doc.id;
  constructor() {
    console.log({bucket:this.bucket})
  }

  get showPrice(){
    return Boolean(this.priceTemplate);
  }

  get showPriceTemplate(){
    return Boolean(this.colActionsTemplate);
  }

  _setPrice(index: number, price: number | string) {
    this.setPrice.emit({ index, price })
  }

  _updatePrice(index: number, price: string) {
    this.updatePrice.emit({ index, price })
  }

  _openDetails(terms: string, scope: Scope) {
    this.openDetails.emit({ terms, scope })
  }

  _removeContract(index: number, title: Movie) {
    this.removeContract.emit({ index, title })
  }

  _removeTerm(contractIndex: number, termIndex: number) {
    this.removeTerm.emit({ contractIndex, termIndex })
  }


}

