import { Component, OnDestroy, OnInit } from '@angular/core';
import { IProjet } from 'app/shared/model/projet.model';
import { JhiDataUtils } from 'ng-jhipster';
import { ActivatedRoute } from '@angular/router';
import { AccountService } from 'app/core/auth/account.service';
import { Account } from 'app/core/user/account.model';
import { User } from 'app/core/user/user.model';
import { UserService } from 'app/core/user/user.service';
import { FormBuilder } from '@angular/forms';
import { Groupe, IGroupe } from 'app/shared/model/groupe.model';
import { GroupeService } from 'app/entities/groupe/groupe.service';
import { UserExtraService } from 'app/entities/user-extra/user-extra.service';

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
  nbEtuArray: (number | undefined)[] | undefined;
  groupeCree: number;

  constructor(
    protected dataUtils: JhiDataUtils,
    protected activatedRoute: ActivatedRoute,
    private accountService: AccountService,
    private userService: UserService,
    private userExtraService: UserExtraService,
    private fb: FormBuilder,
    private groupeService: GroupeService
  ) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ projet }) => (this.projet = projet));
    this.accountService.getAuthenticationState().subscribe(account => {
      this.account = account;
    });
    this.userService.findAll().subscribe(users => {
      for (const u of users) {
        if (u.id !== this.account?.id) {
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
    this.nbEtuArray = Array(this.projet.nbEtudiant - 1);
    let i: number;
    for (i = 0; i < this.nbEtuArray.length; i++) {
      this.nbEtuArray[i] = i + 1;
    }
  }

  ngOnDestroy(): void {}

  postuler(): void {
    this.isSaving = true;
    const nouveauGroupe = this.createGroupe();
    this.groupeService.create(nouveauGroupe).subscribe(
      groupe => {
        let i: number;
        for (i = 0; i < this.nbEtuArray.length; i++) {
          const etuId = 'etu' + this.nbEtuArray[i];
          const etu = (document.getElementById(etuId) as HTMLInputElement).value;
          this.userExtraService.find(+etu).subscribe(userExtra => {
            userExtra.body.groupeId = groupe.body.id;
            this.userExtraService.update(userExtra.body).subscribe();
          });
        }
        this.userExtraService.find(this.account.id).subscribe(userExtra => {
          userExtra.body.groupeId = groupe.body.id;
          this.userExtraService.update(userExtra.body).subscribe();
        });
        this.onSaveSuccess();
      },
      () => this.onSaveError()
    );
  }

  protected onSaveSuccess(): void {
    this.isSaving = false;
    this.previousState();
  }

  protected onSaveError(): void {
    this.isSaving = false;
  }

  previousState(): void {
    window.history.back();
  }

  private createGroupe(): IGroupe {
    return {
      ...new Groupe(),
      valide: false,
      userExtraId: this.account.id,
      projetId: this.projet.id
    };
  }
}
