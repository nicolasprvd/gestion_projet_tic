import { Projet } from 'app/shared/model/projet.model';

export enum TypeDocument {
  GANTT,
  RF,
  CDC
}

export interface IDocument {
  id?: any;
  doc?: Blob;
  typeDocument?: TypeDocument;
  projetId?: bigint;
  projet?: Projet;
}

export class Document implements IDocument {
  constructor(public id?: any, public doc?: Blob, public typeDocument?: TypeDocument, public projetId?: bigint, public projet?: Projet) {}
}
