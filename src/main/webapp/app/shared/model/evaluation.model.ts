import { IUserExtra } from 'app/shared/model/user-extra.model';
import { TypeCursus } from 'app/shared/model/enumerations/type-cursus.model';

export interface IEvaluation {
  id?: number;
  noteCDC?: number;
  noteSoutenance?: number;
  noteRendu?: number;
  noteFinale?: number;
  userExtras?: IUserExtra[];
  actif?: boolean;
  cursus?: TypeCursus;
  coefCDC?: number;
  coefSoutenance?: number;
  coefRendu?: number;
}

export class Evaluation implements IEvaluation {
  constructor(
    public id?: number,
    public noteCDC?: number,
    public noteSoutenance?: number,
    public noteRendu?: number,
    public noteFinale?: number,
    public userExtras?: IUserExtra[],
    public actif?: boolean,
    public cursus?: TypeCursus,
    public coefCDC?: number,
    public coefSoutenance?: number,
    public coefRendu?: number
  ) {}
}
