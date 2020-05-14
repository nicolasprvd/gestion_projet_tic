import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { JhiEventManager } from 'ng-jhipster';

import { User } from 'app/core/user/user.model';
import { UserService } from 'app/core/user/user.service';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { UserExtraService } from 'app/entities/user-extra/user-extra.service';

@Component({
  selector: 'jhi-user-mgmt-delete-dialog',
  templateUrl: './user-management-delete-dialog.component.html'
})
export class UserManagementDeleteDialogComponent {
  user?: User;

  constructor(
    private userService: UserService,
    private userExtraService: UserExtraService,
    public activeModal: NgbActiveModal,
    private eventManager: JhiEventManager,
    private toastrService: ToastrService,
    private translateService: TranslateService
  ) {}

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(login: string): void {
    this.userExtraService.delete(this.user.id).subscribe(() => {
      this.userService.delete(login).subscribe(() => {
        this.eventManager.broadcast('userListModification');
        this.toastrService.success(
          this.translateService.instant('global.toastr.suppression', { prenom: this.user.firstName, nom: this.user.lastName })
        );
        this.activeModal.close();
      });
    });
  }
}
