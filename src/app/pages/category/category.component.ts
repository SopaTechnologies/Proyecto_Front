import { Component, effect, inject } from '@angular/core';
import { PaginationComponent } from '../../components/pagination/pagination.component';
import { CategoryService } from '../../services/category.service';
import { LoaderComponent } from '../../components/loader/loader.component';
import { CategoryCompComponent } from '../../components/category/category-comp/category-comp.component';
import { FormBuilder, Validators } from '@angular/forms';
import { ICategory } from '../../interfaces';
import { CategoryFormComponent } from '../../components/category/category-form/category-form.component';

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [
    PaginationComponent,
    LoaderComponent,
    CategoryCompComponent,
    CategoryFormComponent
  ],
  templateUrl: './category.component.html',
  styleUrl: './category.component.scss'
})
export class CategoryComponent {
  public categoryListService: CategoryService = inject(CategoryService);
  public fb: FormBuilder = inject(FormBuilder);
  public form = this.fb.group({
    id: [0],
    name: ['', Validators.required],
    description: ['', Validators.required]
  })
  constructor() {
    this.categoryListService.getAll();
    effect(() => {
      console.log('categories updated', this.categoryListService.categories$());
    });
  }

  save(item: ICategory){
    item.id ? this.categoryListService.update(item) : this.categoryListService.save(item);
    this.form.reset();
  }

  delete(item: ICategory){
    console.log('delete', item);
    this.categoryListService.del(item);
  }

}
