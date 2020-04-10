import { IGroupe } from 'app/shared/model/groupe.model';
import { IProjet } from 'app/shared/model/projet.model';
import { TypeUtilisateur } from 'app/shared/model/enumerations/type-utilisateur.model';
import { IUser } from 'app/core/user/user.model';

export interface IUserExtra {
  id?: number;
  actif?: boolean;
  typeUtilisateur?: TypeUtilisateur;
  user?: IUser;
  userId?: number;
  groupes?: IGroupe[];
  projets?: IProjet[];
  evaluationId?: number;
  groupeId?: number;
}

export class UserExtra implements IUserExtra {
  constructor(
    public id?: number,
    public actif?: boolean,
    public typeUtilisateur?: TypeUtilisateur,
    public user?: IUser,
    public userId?: number,
    public groupes?: IGroupe[],
    public projets?: IProjet[],
    public evaluationId?: number,
    public groupeId?: number
  ) {
    this.actif = this.actif || false;
  }
}
