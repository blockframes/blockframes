import { Material } from "../../material/+state/material.model";

export interface Template {
  id: string;
  name: string;
  materialsId: string[];
  orgId?: string;
}

export interface TemplateView {
  category: string,
  materials: Material[]
}


/**
 * A factory function that creates Template
 */
export function createTemplate(template: Partial<Template>) {
  return template ? {
    materialsId: [],
    ...template
  } as Template : {} as Template
}

