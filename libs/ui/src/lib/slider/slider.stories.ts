import { SliderComponent } from './slider.component';
import { SliderModule } from './slider.module';
import { ToolkitModule } from '@blockframes/ui/storybook';
import { boolean, text, number, object } from '@storybook/addon-knobs';

export default {
  title: 'Bf Slider'
};

export const bfSlider = () => ({
  moduleMetadata: { imports: [SliderModule, ToolkitModule] },
  name: 'Bf Slider',
  component: SliderComponent,
  template: `
  <storybook-toolkit>
  <h1 title>Bf Slider</h1>
    <bf-slider 
    [autoplay]="autoplay"
    [loop]="loop"
    [swipe]="swipe"
    [ratio]="ratio"
    [interval]="interval"
    [hideIndicators]="hideIndicators"
    [timing]="timing">
      <ng-container *ngFor="let image of images">
        <bf-slide 
        [image]="image" 
        [overlayColor]="overlayColor"
        [hideOverlay]="hideOverlay">
        </bf-slide>
      </ng-container>
    </bf-slider>
</storybook-toolkit>
  `,
  props: {
    autoplay: boolean('autoplay', true),
    loop: boolean('loop', true),
    images: object('images', [
      { url: 'https://via.placeholder.com/600/771796' },
      { url: 'https://via.placeholder.com/600/771796' },
      { url: 'https://via.placeholder.com/600/771796' }
    ]),
    swipe: boolean('swipe', true),
    ratio: text('ratio', ''),
    interval: number('interval', 1000),
    timing: text('timing', "550ms ease-in"),
    hideArrows: boolean('hideArrows', false),
    hideIndicators: boolean('hideIndicators', false),
    slideDirection: text('slideDirection', 'rtl'),
    hideOverlay: boolean('hideOverlay', false),
    overlayColor: text('overlayColor', '#00000080'),
  }
});