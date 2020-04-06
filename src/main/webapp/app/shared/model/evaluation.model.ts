import { User } from 'app/core/user/user.model';

export interface IEvaluation {
  id?: any;
  noteCdc?: any;
  noteSoutenance?: any;
  noteRendu?: any;
  noteFinale?: any;
  etudiantId?: bigint;
  etudiant?: User;
}

export class Evaluation implements IEvaluation {
  constructor(
    public id?: any,
    public noteCdc?: any,
    public noteSoutenance?: any,
    public noteRendu?: any,
    public noteFinale?: any,
    public etudiantId?: bigint,
    public etudiant?: User
  ) {}
}
