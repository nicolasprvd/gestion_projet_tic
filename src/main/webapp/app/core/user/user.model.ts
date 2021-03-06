import { TypeUtilisateur } from 'app/shared/model/enumerations/type-utilisateur.model';
import { TypeCursus } from 'app/shared/model/enumerations/type-cursus.model';

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
  createdDate?: Date;
  lastModifiedBy?: string;
  lastModifiedDate?: Date;
  password?: string;
  typeUtilisateur?: TypeUtilisateur;
  cursus?: TypeCursus;
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
    public createdDate?: Date,
    public lastModifiedBy?: string,
    public lastModifiedDate?: Date,
    public password?: string,
    public typeUtilisateur?: TypeUtilisateur,
    public cursus?: TypeCursus
  ) {}
}
