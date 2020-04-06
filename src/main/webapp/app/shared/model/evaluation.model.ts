import { IUserExtra } from 'app/shared/model/user-extra.model';

export interface IEvaluation {
  id?: number;
  noteCDC?: number;
  noteSoutenance?: number;
  noteRendu?: number;
  noteFinale?: number;
  userExtras?: IUserExtra[];
}

export class Evaluation implements IEvaluation {
  constructor(
    public id?: number,
    public noteCDC?: number,
    public noteSoutenance?: number,
    public noteRendu?: number,
    public noteFinale?: number,
    public userExtras?: IUserExtra[]
  ) {}
}
