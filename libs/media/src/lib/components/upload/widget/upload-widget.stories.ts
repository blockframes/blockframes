import { ToolkitModule } from '@blockframes/ui/storybook';
import { UploadWidgetModule } from './upload-widget.module';


export default {
  title: 'Bf Upload Widget'
};

export const bfUploadWidget = () => ({
  moduleMetadata: { imports: [ToolkitModule, UploadWidgetModule] },
  name: 'Bf Upload Widget',
  template: `
    <storybook-toolkit>
      <h1 title>Bf Upload Widget</h1>
      <bf-upload-widget></bf-upload-widget>
    </storybook-toolkit>
  `,
});