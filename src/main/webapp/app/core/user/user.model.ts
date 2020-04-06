import { Groupe } from 'app/shared/model/groupe.model';
import { Evaluation } from 'app/shared/model/evaluation.model';
import { Moment } from 'moment';

export enum TypeUtilisateur {
  CLIENT,
  ETUDIANT
}

export interface IUser {
  id?: any;
  login?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  activated?: boolean;
  langKey?: string;
  authorities?: string[];
  createdBy?: string;
  createdDate?: Moment;
  lastModifiedBy?: string;
  lastModifiedDate?: Moment;
  password?: string;
  actif?: boolean;
  typeUtilisateur?: TypeUtilisateur;
  groupeId?: bigint;
  groupe?: Groupe;
  evaluationId?: bigint;
  evaluation?: Evaluation;
}

export class User implements IUser {
  constructor(
    public id?: any,
    public login?: string,
    public firstName?: string,
    public lastName?: string,
    public email?: string,
    public activated?: boolean,
    public langKey?: string,
    public authorities?: string[],
    public createdBy?: string,
    public createdDate?: Moment,
    public lastModifiedBy?: string,
    public lastModifiedDate?: Moment,
    public password?: string,
    public actif?: boolean,
    public typeUtilisateur?: TypeUtilisateur,
    public groupeId?: bigint,
    public groupe?: Groupe,
    public evaluationId?: bigint,
    public evaluation?: Evaluation
  ) {}
}
