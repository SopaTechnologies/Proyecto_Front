import { Component, inject, ViewChild} from '@angular/core';
import { ProfileService } from '../../services/profile.service';
import { CommonModule } from '@angular/common';
import { FormsModule, NgModel} from '@angular/forms';
import { IUser } from '../../interfaces';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {
  public profileService = inject(ProfileService);

   @ViewChild("email") emailModel!: NgModel;
    @ViewChild("password") passwordModel!: NgModel;

  public userForm: Partial<IUser> = {
    name: '',
    lastname: '',
    email: ''
  };

  public passwordForm = {
    email: '',
    newPassword: ''
  };

  constructor() {
    this.profileService.getUserInfoSignal();
  }

  ngOnInit() {
    setTimeout(() => {
      const user = this.profileService.user$();
      this.userForm = {
        name: user.name || '',
        lastname: user.lastname || '',
        email: user.email || ''
      };
      this.passwordForm.email = user.email || '';
    }, 100);
  }

  updateUser() {
    this.profileService.updateUser(this.userForm).subscribe();
  }

  updatePassword() {
    this.profileService.updatePassword(this.passwordForm.email, this.passwordForm.newPassword).subscribe();
  }
}
