import { Component, effect, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../services/product.service';
import { CategoryService } from '../../services/category.service';
import {CategoryFormComponent} from '../../components/category/category-form.component';
import { PaginationComponent } from '../../components/pagination/pagination.component';
import { ICategory, IProduct } from '../../interfaces';

@Component({
    selector: 'app-category',
    standalone: true,
    imports: [
        CommonModule,
        CategoryFormComponent,
        PaginationComponent
    ],
    templateUrl: './category.component.html',
})
export class CategoryComponent implements OnInit {

    public categoryService: CategoryService = inject(CategoryService);
    public fb: FormBuilder = inject(FormBuilder);
    public form = this.fb.group({
        id: [0],
        name: ['', Validators.required],
        description: ['', Validators.required]
    });
    constructor(){
        this.categoryService.getAll();
        effect(() => {
            console.log('categories updated', this.categoryService.categories$());
            if (this.categoryService.categories$()[0]) {
                this.categoryService.categories$()[0] ?  this.categoryService.categories$()[0].name = `${this.categoryService.categories$()[0].name} - Updated` : null;
            }
        });
    }

    save(item: ICategory) {
        item.id ? this.categoryService.update(item) : this.categoryService.save(item);
        this.form.reset();
    }
    
   

}
   