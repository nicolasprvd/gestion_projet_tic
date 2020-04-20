import { IProjet } from 'app/shared/model/projet.model';
import { IUserExtra } from 'app/shared/model/user-extra.model';

export interface IGroupe {
  id?: number;
  valide?: boolean;
  projets?: IProjet[];
  userExtras?: IUserExtra[];
  userExtraId?: number;
  projetId?: number;
  actif?: boolean;
}

export class Groupe implements IGroupe {
  constructor(
    public id?: number,
    public valide?: boolean,
    public projets?: IProjet[],
    public userExtras?: IUserExtra[],
    public userExtraId?: number,
    public projetId?: number,
    public actif?: boolean
  ) {
    this.valide = this.valide || false;
    this.actif = this.actif || false;
  }
}
