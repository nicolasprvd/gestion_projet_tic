import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { JhiLanguageService } from 'ng-jhipster';

import { AccountService } from 'app/core/auth/account.service';
import { Account } from 'app/core/user/account.model';
import { LANGUAGES } from 'app/core/language/language.constants';
import { UserExtraService } from 'app/entities/user-extra/user-extra.service';
import { TypeUtilisateur } from 'app/shared/model/enumerations/type-utilisateur.model';

@Component({
  selector: 'jhi-settings',
  templateUrl: './settings.component.html'
})
export class SettingsComponent implements OnInit {
  account!: Account;
  success = false;
  languages = LANGUAGES;
  settingsForm = this.fb.group({
    firstName: [undefined, [Validators.required, Validators.minLength(1), Validators.maxLength(50)]],
    lastName: [undefined, [Validators.required, Validators.minLength(1), Validators.maxLength(50)]],
    email: [undefined, [Validators.required, Validators.minLength(5), Validators.maxLength(254), Validators.email]],
    authorities: [undefined]
  });

  constructor(
    private accountService: AccountService,
    private fb: FormBuilder,
    private languageService: JhiLanguageService,
    private userExtraService: UserExtraService
  ) {}

  ngOnInit(): void {
    this.accountService.identity().subscribe(account => {
      if (account) {
        this.settingsForm.patchValue({
          firstName: account.firstName,
          lastName: account.lastName,
          email: account.email,
          authorities: account.authorities
        });
        this.account = account;
        this.userExtraService.find(account.id).subscribe(extra => {
          if (extra !== null && extra.body !== null) {
            if (extra.body.typeUtilisateur === TypeUtilisateur.ETUDIANT) {
              document.getElementById('email').setAttribute('disabled', 'disabled');
            } else {
              document.getElementById('email').removeAttribute('disabled');
            }
          }
        });
      }
    });
  }

  saveSettings(): void {
    this.success = false;

    this.account.firstName = this.settingsForm.get('firstName')!.value;
    this.account.lastName = this.settingsForm.get('lastName')!.value;
    this.account.email = this.settingsForm.get('email')!.value;

    this.accountService.save(this.account).subscribe(() => {
      this.success = true;

      this.accountService.authenticate(this.account);
    });
  }
}
