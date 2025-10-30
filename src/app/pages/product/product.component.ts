import { Component, effect, inject, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../services/product.service';
import { CategoryService } from '../../services/category.service';
import { IProduct } from '../../interfaces';
import { ProductFormComponent } from '../../components/product/product-form.component';
import { LoaderComponent } from '../../components/loader/loader.component';
import { PaginationComponent } from '../../components/pagination/pagination.component';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-product',
  standalone: true,
  imports: [
    CommonModule,
    ProductFormComponent,
  ],
  templateUrl: './product.component.html'
})

export class ProductComponent implements OnInit {
    public productService: ProductService = inject(ProductService);
    public categoryService: CategoryService = inject(CategoryService);
    public fb: FormBuilder = inject(FormBuilder);
    public areaActionsAvailable: boolean = false;
    public authService: AuthService = inject(AuthService);
    public route: ActivatedRoute = inject(ActivatedRoute);
    public isEdit: boolean = false;

    public form = this.fb.group({
        id: [0],
        name: ['', Validators.required],
        description: [''],
        price: [0],
        amount: [0],
        category: ['', Validators.required]
    });

    constructor() {
        effect(() => {
            console.log('products updated', this.productService.products$());
        });
    }

    ngOnInit(){
        this.categoryService.getAll();
        this.productService.getAll();
        this.route.data.subscribe( data => {
            this.areaActionsAvailable = this.authService.areActionsAvailable(data['authorities'] ? data['authorities'] : []);
            console.log('areaActionsAvailable', this.areaActionsAvailable);
        })
    }

    // save(product: IProduct) {
    //     const categoryId = this.form.get('category')?.value;
    //     if (this.isEdit && product.id) {
    //         product.categoryList = { id: Number(categoryId) };
    //         this.productService.update(product);
    //     } else {
    //         if (categoryId) {
    //             product.categoryList = { id: Number(categoryId) };
    //         }
    //     }
    // }
}
