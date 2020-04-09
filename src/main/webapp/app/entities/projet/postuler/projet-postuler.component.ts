import { Component, OnDestroy, OnInit } from '@angular/core';
import { IProjet } from 'app/shared/model/projet.model';
import { JhiDataUtils } from 'ng-jhipster';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountService } from 'app/core/auth/account.service';
import { Account } from 'app/core/user/account.model';
import { User } from 'app/core/user/user.model';
import { UserService } from 'app/core/user/user.service';
import { FormBuilder } from '@angular/forms';
import { Groupe, IGroupe } from 'app/shared/model/groupe.model';
import { GroupeService } from 'app/entities/groupe/groupe.service';
import { UserExtraService } from 'app/entities/user-extra/user-extra.service';
import { TypeUtilisateur } from 'app/shared/model/enumerations/type-utilisateur.model';
import { IUserExtra, UserExtra } from 'app/shared/model/user-extra.model';

@Component({
  selector: 'jhi-projet-postuler',
  templateUrl: './projet-postuler.component.html',
  styleUrls: ['./projet-postuler.scss']
})
export class ProjetPostulerComponent implements OnInit, OnDestroy {
  isSaving = false;
  projet: IProjet;
  account: Account | null;
  users: User[] = [];
  userExtras: UserExtra[] = [];
  nbEtuArray: (number | undefined)[] | undefined;
  groupeCree: number;

  constructor(
    protected dataUtils: JhiDataUtils,
    protected activatedRoute: ActivatedRoute,
    private accountService: AccountService,
    private userService: UserService,
    private userExtraService: UserExtraService,
    private fb: FormBuilder,
    private groupeService: GroupeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ projet }) => (this.projet = projet));
    this.accountService.getAuthenticationState().subscribe(account => {
      this.account = account;
    });
    this.userExtraService.findAll().subscribe(userExtras => {
      this.userExtras = userExtras;
      this.userService.findAll().subscribe(users => {
        for (const u of users) {
          if (u.id !== this.account?.id && this.isEtudiantActif(u.id) && !this.aDejaUnGroupe(u.id)) {
            u.firstName = u.firstName?.toLowerCase();
            u.lastName = u.lastName?.toLowerCase();
            this.users.push(u);
          }
        }
        this.users.sort((n1: User, n2: User) => {
          if (n1.firstName > n2.firstName) {
            return 1;
          }
          if (n1.firstName < n2.firstName) {
            return -1;
          }
          return 0;
        });
      });
    });
    this.nbEtuArray = Array(this.projet.nbEtudiant - 1);
    let i: number;
    for (i = 0; i < this.nbEtuArray.length; i++) {
      this.nbEtuArray[i] = i + 1;
    }
  }

  ngOnDestroy(): void {}

  /**
   * If the group is valid, make the basic entries:
   * - create a row in the group table
   * - modify the group id of each user (extra)
   */
  postuler(): void {
    if (this.validationGroupe()) {
      this.isSaving = true;
      const nouveauGroupe = this.createGroupe();
      this.groupeService.create(nouveauGroupe).subscribe(
        groupe => {
          for (let i = 0; i < this.nbEtuArray.length; i++) {
            const etuId = 'etu' + this.nbEtuArray[i];
            const etu = (document.getElementById(etuId) as HTMLInputElement).value;
            const userExtraAModifier = this.getUserExtra(+etu);
            userExtraAModifier.groupeId = groupe.body.id;
            this.userExtraService.update(userExtraAModifier).subscribe();
          }
          const userExtraCourant = this.getUserExtra(this.account.id);
          userExtraCourant.groupeId = groupe.body.id;
          this.userExtraService.update(userExtraCourant).subscribe(() => {
            this.onSaveSuccess();
          });
        },
        () => this.onSaveError()
      );
    }
  }

  protected onSaveSuccess(): void {
    this.isSaving = false;
    this.previousState();
  }

  protected onSaveError(): void {
    this.isSaving = false;
  }

  previousState(): void {
    this.router.navigate(['/projet']);
  }

  /**
   * Create a group
   */
  private createGroupe(): IGroupe {
    return {
      ...new Groupe(),
      valide: false,
      userExtraId: this.account.id,
      projetId: this.projet.id
    };
  }

  /**
   * Return true if the param user already has a group
   * @param utilisateur
   */
  private aDejaUnGroupe(utilisateur: number): boolean {
    for (const extra of this.userExtras) {
      if (extra.id === utilisateur) {
        return extra.groupeId !== null;
      }
    }
    return false;
  }

  /**
   * get the user extra of the user param
   * @param utilisateur
   */
  private getUserExtra(utilisateur: number): IUserExtra {
    for (const extra of this.userExtras) {
      if (extra.id === utilisateur) {
        return extra;
      }
    }
    return null;
  }

  /**
   * Return true if the user param is a student and is active
   * @param utilisateur
   */
  private isEtudiantActif(utilisateur: number): boolean {
    for (const extra of this.userExtras) {
      if (extra.id === utilisateur) {
        return extra.typeUtilisateur === TypeUtilisateur.ETUDIANT && extra.actif;
      }
    }
    return false;
  }

  /**
   * Check if the group has the requested number of students
   * Return false and colors the select in red if:
   * - a select is empty
   * - there is 2 times or more the same person
   */
  validationGroupe(): boolean {
    const ids: number[] = [];
    let valide = true;
    for (let i = 0; i < this.nbEtuArray.length; i++) {
      const etuId = 'etu' + this.nbEtuArray[i];
      document.getElementById(etuId).setAttribute('style', 'background-color:white');
      const etu = (document.getElementById(etuId) as HTMLInputElement).value;
      if (etuId === null || etu === '') {
        document.getElementById(etuId).setAttribute('style', 'background-color:#d65959');
        valide = false;
      }
      if (ids.includes(+etu)) {
        document.getElementById(etuId).setAttribute('style', 'background-color:#d65959');
        valide = false;
      }
      ids.push(+etu);
    }
    return valide;
  }
}
