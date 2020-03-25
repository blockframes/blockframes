import { TemplateRef, Directive } from "@angular/core";

@Directive({ selector: 'cal-event-small, [calEventSmall]' })
export class EventSmallDirective {
  constructor(public template: TemplateRef<any>){}
}

@Directive({ selector: 'cal-event-large, [calEventLarge]' })
export class EventLargeDirective {
  constructor(public template: TemplateRef<any>){}
}