import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { IProduct, ICategory } from '/../../../Users/ricar/Desktop/Tarea2/demo-angular-front/src/app/interfaces';


@Component({
    selector: 'app-product-form',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule
    ],
    templateUrl: './product-form.component.html'
})
export class ProductFormComponent {
    @Input() form!: FormGroup;
    @Input() isEdit: boolean = false;
    @Input() categories: ICategory[] = [];
    @Input() showCategorySelector: boolean = true;
    @Output() callSaveMethod: EventEmitter<IProduct> = new EventEmitter<IProduct>();
}