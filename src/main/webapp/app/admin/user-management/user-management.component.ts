import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { flatMap } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { JhiEventManager } from 'ng-jhipster';
import { AccountService } from 'app/core/auth/account.service';
import { Account } from 'app/core/user/account.model';
import { UserService } from 'app/core/user/user.service';
import { IUser, User } from 'app/core/user/user.model';
import { UserManagementDeleteDialogComponent } from './user-management-delete-dialog.component';
import { UserExtraService } from 'app/entities/user-extra/user-extra.service';
import { TranslateService } from '@ngx-translate/core';
import { ProjetService } from 'app/entities/projet/projet.service';
import { IUserExtra } from 'app/shared/model/user-extra.model';
import { ToastrService } from 'ngx-toastr';
import { TypeCursus } from 'app/shared/model/enumerations/type-cursus.model';
import { TypeUtilisateur } from 'app/shared/model/enumerations/type-utilisateur.model';

@Component({
  selector: 'jhi-user-mgmt',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.scss']
})
export class UserManagementComponent implements OnInit, OnDestroy {
  currentAccount: Account | null = null;
  users: User[] | null = [];
  usersFilter: User[] | null = [];
  userListSubscription?: Subscription;
  page = 1;
  predicate!: string;
  previousPage!: number;
  ascending!: boolean;
  subject: string;
  content: string;
  userExtra: IUserExtra;
  modification: string;
  usersExtraArray: {
    key: number;
    value: IUserExtra;
  }[] = [];
  items: number[] = [];
  pageSize = 20;
  L3: TypeCursus = TypeCursus.L3;
  M1: TypeCursus = TypeCursus.M1;
  M2: TypeCursus = TypeCursus.M2;
  cursusSelectionne: TypeCursus;
  allUsers: boolean;

  constructor(
    private userService: UserService,
    private accountService: AccountService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private eventManager: JhiEventManager,
    private modalService: NgbModal,
    private userExtraService: UserExtraService,
    private translateService: TranslateService,
    protected projetService: ProjetService,
    private toastrService: ToastrService
  ) {}

  ngOnInit(): void {
    this.activatedRoute.data
      .pipe(
        flatMap(
          () => this.accountService.identity(),
          (data, account) => {
            this.page = data.pagingParams.page;
            this.previousPage = data.pagingParams.page;
            this.ascending = data.pagingParams.ascending;
            this.predicate = data.pagingParams.predicate;
            this.currentAccount = account;
            this.loadAll();
            this.userListSubscription = this.eventManager.subscribe('userListModification', () => this.loadAll());
          }
        )
      )
      .subscribe();

    for (let i = 0; i < 20; i++) {
      this.items.push(i);
    }
  }

  ngOnDestroy(): void {
    if (this.userListSubscription) {
      this.eventManager.destroy(this.userListSubscription);
    }
  }

  setActive(user: User, isActivated: boolean): void {
    user.activated = isActivated;
    this.userService.update(user).subscribe();
    this.userExtraService.find(user.id).subscribe(userExtra => {
      this.userExtra = userExtra.body;
      this.userExtra.actif = isActivated;
      this.userExtraService.update(this.userExtra).subscribe();
    });

    if (isActivated === true) {
      this.subject = this.translateService.instant('global.email.compteValide.sujet');
      this.content = this.translateService.instant('global.email.compteValide.message');
      this.modification = this.translateService.instant('global.toastr.activation', { prenom: user.firstName, nom: user.lastName });
    } else {
      this.subject = this.translateService.instant('global.email.compteNonValide.sujet');
      this.content = this.translateService.instant('global.email.compteNonValide.message');
      this.modification = this.translateService.instant('global.toastr.desactivation', { prenom: user.firstName, nom: user.lastName });
    }
    this.projetService.sendMail(user.email, this.subject, this.content).subscribe();
    this.toastrService.success(this.modification);
  }

  trackIdentity(index: number, item: User): any {
    return item.id;
  }

  deleteUser(user: User): void {
    const modalRef = this.modalService.open(UserManagementDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.user = user;
    this.subject = this.translateService.instant('global.email.compteSupprimer.sujet');
    this.content = this.translateService.instant('global.email.compteSupprimer.message');
    this.projetService.sendMail(user.email, this.subject, this.content).subscribe();
  }

  private loadAll(): void {
    this.userExtraService.findAll().subscribe(ue => {
      if (ue !== null) {
        this.usersExtraArray.push({ key: 0, value: null });
        ue.forEach(extra => {
          this.usersExtraArray.push({ key: extra.id, value: extra });
        });
        this.userService.findAllWithAuthorities().subscribe(users => {
          if (users !== null) {
            users.forEach(user => {
              user.cursus = this.usersExtraArray[user.id]?.value.cursus;
              user.typeUtilisateur = this.usersExtraArray[user.id]?.value.typeUtilisateur;
            });
            const allUsers = this.usersExtraArray;
            this.users = users;
            this.usersFilter = users;
            this.users.sort(function(user1, user2): number {
              if (allUsers[user1.id].value.cursus === allUsers[user2.id].value.cursus) {
                return user1.lastName.localeCompare(user2.lastName);
              } else if (allUsers[user1.id].value.cursus === null) {
                return -1;
              } else if (allUsers[user2.id].value.cursus === null) {
                return 1;
              } else {
                return allUsers[user1.id].value.cursus.localeCompare(allUsers[user2.id].value.cursus);
              }
            });
          }
        });
      }
    });
  }

  public isMasterStudent(user: IUser): boolean {
    return user.typeUtilisateur === TypeUtilisateur.ETUDIANT && user.cursus !== TypeCursus.L3;
  }

  public repeatYear(user: IUser): void {
    if (this.isMasterStudent(this.usersExtraArray[user.id].value)) {
      if (this.usersExtraArray[user.id].value.cursus === TypeCursus.M1) {
        this.usersExtraArray[user.id].value.cursus = TypeCursus.L3;
      }

      if (this.usersExtraArray[user.id].value.cursus === TypeCursus.M2 && user.activated) {
        this.usersExtraArray[user.id].value.cursus = TypeCursus.M1;
      }

      if (this.usersExtraArray[user.id].value.cursus === TypeCursus.M2 && !user.activated) {
        user.activated = true;
        this.usersExtraArray[user.id].value.actif = true;
        this.userService.update(user).subscribe();
      }
      this.userExtraService.update(this.usersExtraArray[user.id].value).subscribe(() => {
        this.toastrService.success(
          this.translateService.instant('global.toastr.modifications.redoubler.message'),
          this.translateService.instant('global.toastr.modifications.redoubler.title', { prenom: user.firstName, nom: user.lastName })
        );
        this.loadAll();
      });
    }
  }

  filtrerGroupes(niveau: TypeCursus): void {
    this.allUsers = false;
    this.cursusSelectionne = niveau;
    this.usersFilter = [];
    for (const user of this.users) {
      if (user.cursus === niveau) {
        this.usersFilter.push(user);
      }
    }
    this.modifierCouleurBoutonFiltre(niveau);
  }

  reinitFiltreGroupes(): void {
    this.allUsers = true;
    this.cursusSelectionne = null;
    this.usersFilter = this.users;
    this.modifierCouleurBoutonFiltre(null);
  }

  modifierCouleurBoutonFiltre(niveau: TypeCursus): void {
    document.getElementById('filtreAucun').setAttribute('class', 'btn btn-danger btn-sm');
    document.getElementById('filtreClient').setAttribute('class', 'btn btn-danger btn-sm');
    document.getElementById('filtreL3').setAttribute('class', 'btn btn-danger btn-sm');
    document.getElementById('filtreM1').setAttribute('class', 'btn btn-danger btn-sm');
    document.getElementById('filtreM2').setAttribute('class', 'btn btn-danger btn-sm');
    if (niveau === null && this.allUsers) {
      document.getElementById('filtreAucun').setAttribute('class', 'btn btn-success btn-sm');
    } else if (niveau === null && !this.allUsers) {
      document.getElementById('filtreClient').setAttribute('class', 'btn btn-success btn-sm');
    } else if (niveau === TypeCursus.L3) {
      document.getElementById('filtreL3').setAttribute('class', 'btn btn-success btn-sm');
    } else if (niveau === TypeCursus.M1) {
      document.getElementById('filtreM1').setAttribute('class', 'btn btn-success btn-sm');
    } else {
      document.getElementById('filtreM2').setAttribute('class', 'btn btn-success btn-sm');
    }
  }
}
