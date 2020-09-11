import { staticModels, staticConsts } from '@blockframes/utils/static-model';
import { Component, ChangeDetectionStrategy, Input, ContentChild, TemplateRef, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { coerceBooleanProperty } from '@angular/cdk/coercion';

@Component({
  selector: '[scope][type][control] static-select',
  templateUrl: './static-select.component.html',
  styleUrls: ['./static-select.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StaticSelectComponent implements OnInit {

  public _scope: [];
  @Input() scope;
  @Input() type: 'constant' | 'model';
  @Input() control: FormControl;
  @Input() mode: 'legacy' | 'standard' | 'fill' | 'outline' = 'outline';
  @Input() placeholder: string;
  @Input()
  set required(value: boolean) {
    this._required = coerceBooleanProperty(value);
  }
  @ContentChild(TemplateRef) template: TemplateRef<any>;
/* TODO MF

 for main component form 
 I think Season, Volume, Episode and Collection can go
16:32 Uhr
the rest should stay. but would it be possible to change "Short" to "Short Film" and "Serie" to "TV Series"*/
  public _required: boolean;

  ngOnInit() {
    if(this.type === 'constant') {
      this._scope = staticConsts[this.scope];
    } else {
      this._scope = staticModels[this.scope];
    }
  }
}
