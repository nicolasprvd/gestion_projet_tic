import { Groupe } from 'app/shared/model/groupe.model';
import { User } from 'app/core/user/user.model';

export interface IProjet {
  id?: any;
  nom?: string;
  descriptionPdf?: Blob;
  descriptionTexte?: string;
  nbEtudiant?: bigint;
  automatique?: boolean;
  archive?: boolean;
  authorities?: string[];
  groupeId?: bigint;
  groupe?: Groupe;
  client_id?: bigint;
  user?: User;
}

export class Projet implements IProjet {
  constructor(
    public id?: any,
    public nom?: string,
    public descriptionPdf?: Blob,
    public descriptionTexte?: string,
    public nbEtudiant?: bigint,
    public automatique?: boolean,
    public archive?: boolean,
    public authorities?: string[],
    public groupeId?: bigint,
    public groupe?: Groupe,
    public client_id?: bigint,
    public client?: User
  ) {}
}
