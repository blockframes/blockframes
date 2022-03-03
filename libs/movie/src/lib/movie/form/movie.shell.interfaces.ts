import { InjectionToken } from "@angular/core";
import { EntityControl, FormEntity } from '@blockframes/utils/form';
import type { CampaignShellConfig } from '@blockframes/campaign/form/campaign.shell.config';
import type { MovieShellConfig } from './movie.shell.config';
import { FormSaveOptions } from "@blockframes/utils/common-interfaces";

export const FORMS_CONFIG = new InjectionToken<ShellConfig>('List of form managed by the shell');

export interface FormShellConfig<Control extends EntityControl<Entity>, Entity> {
  form: FormEntity<Control, Entity>;
  name: string
  onInit(): void;
  onSave(options: FormSaveOptions): Promise<unknown>
}

export interface ShellConfig {
  movie: MovieShellConfig;
  campaign?: CampaignShellConfig
}