import { InjectionToken } from "@angular/core";
import { AngularFireUploadTask } from "@angular/fire/storage";

export const REFERENCES = new InjectionToken('References', { factory: () => ({ tasks: <Record<string, AngularFireUploadTask>> {} })});