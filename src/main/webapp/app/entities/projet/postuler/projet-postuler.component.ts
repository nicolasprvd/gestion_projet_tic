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
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'jhi-projet-postuler',
  templateUrl: './projet-postuler.component.html',
  styleUrls: ['./projet-postuler.scss']
})
export class ProjetPostulerComponent implements OnInit, OnDestroy {
  isSaving = false;
  project: IProjet;
  account: Account | null;
  accountExtra: IUserExtra;
  users: User[] = [];
  userExtras: UserExtra[] = [];
  numberStudentOfProjectArray: (number | undefined)[] | undefined;

  constructor(
    protected dataUtils: JhiDataUtils,
    protected activatedRoute: ActivatedRoute,
    private accountService: AccountService,
    private userService: UserService,
    private userExtraService: UserExtraService,
    private fb: FormBuilder,
    private groupeService: GroupeService,
    private router: Router,
    private translateService: TranslateService,
    private toastrService: ToastrService
  ) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ project }) => (this.project = project));
    this.accountService.getAuthenticationState().subscribe(account => {
      if (account !== null) {
        account.firstName = this.formatNom(account.firstName);
        account.lastName = account.lastName.toUpperCase();
        this.account = account;
        this.userExtraService.find(this.account.id).subscribe(currentUser => {
          if (currentUser !== null && currentUser.body !== undefined) {
            this.accountExtra = currentUser.body;
            if(currentUser.body.cursus !== null) {
              this.userExtraService.findByActifAndCursus(true, currentUser.body.cursus).subscribe(userExtras => {
                if (userExtras !== null && userExtras.body !== null) {
                  this.userExtras = userExtras.body;
                  this.userService.findByActivated(true).subscribe(users => {
                    if (users !== null) {
                      for (const u of users) {
                        if (u.id !== this.account?.id && this.isActiveUser(u.id) && !this.alreadyHasGroup(u.id)) {
                          u.firstName = this.formatNom(u.firstName);
                          u.lastName = u.lastName.toUpperCase();
                          this.users.push(u);
                        }
                      }
                      this.users.sort((n1: User, n2: User) => {
                        if (n1.lastName > n2.lastName) {
                          return 1;
                        }
                        if (n1.lastName < n2.lastName) {
                          return -1;
                        }
                        return 0;
                      });
                    }
                  });
                }
              });
            }
          }
        });
      }
    });
    this.numberStudentOfProjectArray = Array(this.project.nbEtudiant - 1);
    let i: number;
    for (i = 0; i < this.numberStudentOfProjectArray.length; i++) {
      this.numberStudentOfProjectArray[i] = i + 1;
    }
  }

  ngOnDestroy(): void {}

  /**
   * Insert or update a Groupe object into database
   */
  apply(): void {
    if (this.groupValidation()) {
      this.isSaving = true;
      const newGroup = this.createGroupe();
      this.groupeService.create(newGroup).subscribe(
        group => {
          for (let i = 0; i < this.numberStudentOfProjectArray.length; i++) {
            const studentFormId = 'etu' + this.numberStudentOfProjectArray[i];
            const student = (document.getElementById(studentFormId) as HTMLInputElement).value;
            const extraUpdated = this.getUserExtra(+student);
            extraUpdated.groupeId = group.body.id;
            this.userExtraService.update(extraUpdated).subscribe();
          }
          const currentExtraUpdated = this.getUserExtra(this.account.id);
          currentExtraUpdated.groupeId = group.body.id;
          this.userExtraService.update(currentExtraUpdated).subscribe(() => {
            this.isSaving = false;
            this.toastrService.success(
              this.translateService.instant('global.toastr.candidature.projet.message'),
              this.translateService.instant('global.toastr.candidature.projet.title', { nom: this.project.nom })
            );
            this.previousState();
          });
        },
        () => {
          this.isSaving = false;
          this.toastrService.error(
            this.translateService.instant('global.toastr.erreur.message'),
            this.translateService.instant('global.toastr.erreur.title')
          );
        }
      );
    }
  }

  previousState(): void {
    this.router.navigate(['/projet']);
  }

  /**
   * Create a Groupe object
   */
  private createGroupe(): IGroupe {
    return {
      ...new Groupe(),
      valide: false,
      userExtraId: this.account.id,
      projetId: this.project.id,
      actif: true,
      cursus: this.accountExtra.cursus
    };
  }

  /**
   * Return true if the param user already has a group
   * @param user
   */
  alreadyHasGroup(user: number): boolean {
    if (this.userExtras !== null && this.userExtras !== undefined) {
      for (const extra of this.userExtras) {
        if (extra.id === user) {
          return extra.groupeId !== null;
        }
      }
    }
    return false;
  }

  /**
   * get the user extra of the user param
   * @param user
   */
  getUserExtra(user: number): IUserExtra {
    if (this.userExtras !== null && this.userExtras !== undefined) {
      for (const extra of this.userExtras) {
        if (extra.id === user) {
          return extra;
        }
      }
    }
    return null;
  }

  /**
   * Return true if the user param is a student and is active
   * @param user
   */
  isActiveUser(user: number): boolean {
    if (this.userExtras !== null && this.userExtras !== undefined) {
      for (const extra of this.userExtras) {
        if (extra.id === user) {
          return extra.typeUtilisateur === TypeUtilisateur.ETUDIANT && extra.actif;
        }
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
  groupValidation(): boolean {
    const ids: number[] = [];
    let valid = true;
    for (let i = 0; i < this.numberStudentOfProjectArray.length; i++) {
      const studentFormId = 'etu' + this.numberStudentOfProjectArray[i];
      document.getElementById(studentFormId).setAttribute('style', 'background-color:white');
      const student = (document.getElementById(studentFormId) as HTMLInputElement).value;
      if (studentFormId === null || student === '') {
        document.getElementById(studentFormId).setAttribute('style', 'background-color:#d65959');
        valid = false;
      }
      if (ids.includes(+student)) {
        document.getElementById(studentFormId).setAttribute('style', 'background-color:#d65959');
        valid = false;
      }
      ids.push(+student);
    }
    return valid;
  }

  /**
   * Format the name
   * entry : aaaaaaa
   * return : Aaaaaaa
   * @param str
   */
  formatNom(str: string): string {
    str = str.toLowerCase();
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}
