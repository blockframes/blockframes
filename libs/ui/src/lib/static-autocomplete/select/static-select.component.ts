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
  public staticValue: string[];
  @ContentChild(TemplateRef) template: TemplateRef<unknown>;
  @Input() scope: Scope
  @Input() @boolean multiple: boolean;
  @Input() control: FormControl;
  @Input() mode: 'legacy' | 'standard' | 'fill' | 'outline' = 'outline';
  @Input() placeholder: string;
  @Input() @boolean required: boolean;
  @Input() withoutValues: string[];
  @Input() only: string[];

  ngOnInit() {
    if (this.withoutValues) {
      this.staticValue = Object.keys(staticModel[this.scope]).filter((keys) => !this.withoutValues.includes(keys));
    } else if (this.only) {
      this.staticValue = this.only;
    } else {
      this.staticValue = Object.keys(staticModel[this.scope]);
    }
  }

  get showEmptyOption() {
    return !this.required && !this.multiple;
  }
}
