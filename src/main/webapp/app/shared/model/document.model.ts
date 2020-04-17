import { TypeDocument } from 'app/shared/model/enumerations/type-document.model';
import { IProjet } from 'app/shared/model/projet.model';

export interface IDocument {
  id?: number;
  docContentType?: string;
  doc?: any;
  typeDocument?: TypeDocument;
  projetId?: number;
  projet?: IProjet;
  actif?: boolean;
}

export class Document implements IDocument {
  constructor(
    public id?: number,
    public docContentType?: string,
    public doc?: any,
    public typeDocument?: TypeDocument,
    public projetId?: number,
    public projet?: IProjet,
    public actif?: boolean
  ) {}
}
