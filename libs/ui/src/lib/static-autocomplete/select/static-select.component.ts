// Angular
import { Component, ChangeDetectionStrategy, Input, ContentChild, TemplateRef, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

// Blockframes
import { Scope, staticModel } from '@blockframes/utils/static-model';
import { boolean } from '@blockframes/utils/decorators/decorators';

@Component({
  selector: '[scope][control] static-select',
  templateUrl: './static-select.component.html',
  styleUrls: ['./static-select.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StaticSelectComponent implements OnInit {

  public staticValue: any[];
  @Input() scope: Scope
  @Input() control: FormControl;
  @Input() mode: 'legacy' | 'standard' | 'fill' | 'outline' = 'outline';
  @Input() placeholder: string;
  @Input() @boolean required: boolean;
  @Input() withoutValues: string[] = []

  ngOnInit() {
    this.staticValue = this.withoutValues.length
      ? Object.keys(staticModel[this.scope]).filter((keys) => !this.withoutValues.includes(keys))
      : Object.keys(staticModel[this.scope]);
  }

  @ContentChild(TemplateRef) template: TemplateRef<any>;
}
