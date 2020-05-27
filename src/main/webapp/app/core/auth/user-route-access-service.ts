import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { AccountService } from 'app/core/auth/account.service';
import { LoginModalService } from 'app/core/login/login-modal.service';
import { StateStorageService } from './state-storage.service';
import { ProjetService } from 'app/entities/projet/projet.service';
import { UserExtraService } from 'app/entities/user-extra/user-extra.service';
import { GroupeService } from 'app/entities/groupe/groupe.service';
import { IUserExtra } from 'app/shared/model/user-extra.model';
import { TypeUtilisateur } from 'app/shared/model/enumerations/type-utilisateur.model';

@Injectable({ providedIn: 'root' })
export class UserRouteAccessService implements CanActivate {
  user: IUserExtra;

  constructor(
    private router: Router,
    private loginModalService: LoginModalService,
    private accountService: AccountService,
    private stateStorageService: StateStorageService,
    private projetService: ProjetService,
    private userExtraService: UserExtraService,
    private groupeService: GroupeService
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    const authorities = route.data['authorities'];

    // We need to call the checkLogin / and so the accountService.identity() function, to ensure,
    // that the client has a principal too, if they already logged in by the server.
    // This could happen on a page refresh.
    return this.checkLogin(authorities, state.url);
  }

  checkLogin(authorities: string[], url: string): Observable<boolean> {
    return this.accountService.identity().pipe(
      map(account => {
        if (!authorities || authorities.length === 0) {
          return true;
        }

        if (account) {
          this.userExtraService.find(account.id).subscribe(user => {
            this.user = user.body;

            if (url.split('/').length === 4) {
              if (url.split('/')[3] === 'rate' || url.split('/')[3] === 'edit') {
                // Cas etudiant
                if (this.user.typeUtilisateur === TypeUtilisateur.ETUDIANT) {
                  this.router.navigate(['404']);
                  return false;
                } else if (this.user.typeUtilisateur === TypeUtilisateur.CLIENT) {
                  if(url.split('/')[3] === 'rate') {
                    if(authorities.includes('ROLE_ADMIN')) {
                      return true;
                    }
                  }
                  const idProjet = url.split('/')[2];
                  this.projetService.find(+idProjet).subscribe(projet => {
                    if (projet.body.userExtraId !== this.user.id) {
                      this.router.navigate(['404']);
                      return false;
                    } else {
                      if (url.split('/')[3] === 'rate') {
                        this.groupeService.findByProjetId(projet.body.id).subscribe(groupe => {
                          if (groupe.body === null) {
                            this.router.navigate(['404']);
                            return false;
                          } else {
                            return true;
                          }
                        });
                        return true;
                      }
                    }
                    return true;
                  });
                }
              } else if (url.split('/')[3] === 'attribuer') {
                // Cas etudiant
                if (this.user.typeUtilisateur === TypeUtilisateur.ETUDIANT) {
                  this.router.navigate(['404']);
                  return false;
                } else if (this.user.typeUtilisateur === TypeUtilisateur.CLIENT) {
                  const idProjet = url.split('/')[2];
                  this.groupeService.findAllByProjetId(+idProjet).subscribe(groups => {
                    if(groups.body.length > 0) {
                      groups.body.forEach(group => {
                        // If the project is assigned
                        if(group.valide) {
                          this.router.navigate(['404']);
                          return false;
                        }else {
                          return true;
                        }
                      });
                    }else {
                      this.router.navigate(['404']);
                      return false;
                    }
                    return true;
                  });

                  // Si le projet appartient au client
                  this.projetService.find(+idProjet).subscribe(projet => {
                    if (projet.body.userExtraId === this.user.id) {
                      return true;
                    } else {
                      this.router.navigate(['404']);
                      return false;
                    }
                  });
                }
              } else if (url.split('/')[3] === 'postuler') {
                if (this.user.groupeId !== null) {
                  this.router.navigate(['404']);
                  return false;
                }
                return true;
              }
            } else if (url.split('/').length === 3) {
              if (url.split('/')[1] === 'projet' && url.split('/')[2] === 'etudiant') {
                if (this.user.groupeId !== null) {
                  this.groupeService.find(this.user.groupeId).subscribe(groupe => {
                    if (!groupe.body.valide) {
                      this.router.navigate(['404']);
                      return false;
                    } else {
                      return true;
                    }
                  });
                } else {
                  this.router.navigate(['404']);
                  return false;
                }
              }
            }
            return true;
          });
          const hasAnyAuthority = this.accountService.hasAnyAuthority(authorities);
          if (hasAnyAuthority) {
            return true;
          }

          this.router.navigate(['accessdenied']);
          return false;
        }

        this.stateStorageService.storeUrl(url);
        this.router.navigate(['']);
        this.loginModalService.open();
        return false;
      })
    );
  }
}
