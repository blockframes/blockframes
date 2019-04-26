import {Directive, Renderer2, ElementRef, Input, OnInit} from '@angular/core';

@Directive({
  selector: '[deliveryDotColor]'
})
export class DotColorDirective implements OnInit {

  @Input('deliveryDotColor') id: string;
  private colors = ['#ee4825', '#2577ee', '#d925ee', '#25ee53', '#7c857e', '#d375d8', '#75d2d8', '#d0c461'];

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnInit() {
    this.renderer.setStyle(this.el.nativeElement, 'background-color', this.getColor());
  }

  private getColor() {
    const index = this.id.charCodeAt(0) % this.colors.length;
    return this.colors[index];
  }
}
