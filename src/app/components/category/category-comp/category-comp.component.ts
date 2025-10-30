import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ICategory } from '../../../interfaces';

@Component({
  selector: 'app-category-comp',
  standalone: true,
  imports: [],
  templateUrl: './category-comp.component.html',
  styleUrl: './category-comp.component.scss'
})
export class CategoryCompComponent {

  @Input() categories: ICategory[] = [];
  @Output() callEditMethod: EventEmitter<ICategory> = new EventEmitter<ICategory>();
  @Output() callDeleteMethod: EventEmitter<ICategory> = new EventEmitter<ICategory>();
}
