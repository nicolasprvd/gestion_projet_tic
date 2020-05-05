import { IGroupe } from 'app/shared/model/groupe.model';
import { IProjet } from 'app/shared/model/projet.model';
import { TypeUtilisateur } from 'app/shared/model/enumerations/type-utilisateur.model';
import { IUser } from 'app/core/user/user.model';
import { TypeCursus } from 'app/shared/model/enumerations/type-cursus.model';

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
  cursus?: TypeCursus;
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
    public groupeId?: number,
    public cursus?: TypeCursus
  ) {
    this.actif = this.actif || false;
  }
}
