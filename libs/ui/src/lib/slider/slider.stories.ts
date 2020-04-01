import { SliderComponent } from './slider.component';
import { SliderModule } from './slider.module';
import { ToolkitModule } from '@blockframes/ui/storybook';
import { boolean, array } from '@storybook/addon-knobs';

export default {
  title: 'Bf Slider'
};

export const bfSlider = () => ({
  moduleMetadata: { imports: [SliderModule, ToolkitModule] },
  name: 'Bf Slider',
  component: SliderComponent,
  template:`
  <storybook-toolkit>
  <h1 title>Bf Slider</h1>
    <bf-slider>
      <ng-container *ngFor="let image of images">
        <bf-slide [image]="image">
        </bf-slide>
      </ng-container>
    </bf-slider>
</storybook-toolkit>
  `,
  props: {
    autoplay: boolean('autoplay', true),
    loop: boolean('loop', true),
    images: array('images', ['https://via.placeholder.com/600/24f355', 'https://via.placeholder.com/600/24f354']),
    swipe: boolean('swipe', true)
  }
});