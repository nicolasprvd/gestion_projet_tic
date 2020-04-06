import { IDocument } from 'app/shared/model/document.model';
import { IGroupe } from 'app/shared/model/groupe.model';

export interface IProjet {
  id?: number;
  nom?: string;
  descriptionPDFContentType?: string;
  descriptionPDF?: any;
  descriptionTexte?: string;
  nbEtudiant?: number;
  automatique?: boolean;
  archive?: boolean;
  documents?: IDocument[];
  groupes?: IGroupe[];
  groupeId?: number;
  userExtraId?: number;
}

export class Projet implements IProjet {
  constructor(
    public id?: number,
    public nom?: string,
    public descriptionPDFContentType?: string,
    public descriptionPDF?: any,
    public descriptionTexte?: string,
    public nbEtudiant?: number,
    public automatique?: boolean,
    public archive?: boolean,
    public documents?: IDocument[],
    public groupes?: IGroupe[],
    public groupeId?: number,
    public userExtraId?: number
  ) {
    this.automatique = this.automatique || false;
    this.archive = this.archive || false;
  }
}
