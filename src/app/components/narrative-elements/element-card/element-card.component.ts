import { Component, Input, input } from '@angular/core';
import { NarrativeElementModel } from '../../../models/narrative-element.model';

@Component({
  selector: 'app-element-card',
  standalone: true,
  imports: [],
  templateUrl: './element-card.component.html',
  styleUrl: './element-card.component.scss'
})
export class ElementCardComponent {

  @Input() element: NarrativeElementModel | null = null;

}
