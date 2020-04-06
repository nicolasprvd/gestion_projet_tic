import { User } from 'app/core/user/user.model';
import { Projet } from 'app/shared/model/projet.model';

export interface IGroupe {
  id?: any;
  valide?: boolean;
  chefId?: bigint;
  chef?: User;
  projetId?: bigint;
  projet?: Projet;
}

export class Groupe implements IGroupe {
  constructor(
    public id?: any,
    public valide?: boolean,
    public chefId?: bigint,
    public chef?: User,
    public projetId?: bigint,
    public projet?: Projet
  ) {}
}
