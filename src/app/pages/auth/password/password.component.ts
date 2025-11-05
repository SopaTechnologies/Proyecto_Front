import { Component } from '@angular/core';
import { Router, RouterLink } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import Swal from "sweetalert2";

@Component({
  selector: 'app-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './password.component.html',
  styleUrl: './password.component.scss'
})
export class PasswordComponent {

  passchange(){

  }

}
