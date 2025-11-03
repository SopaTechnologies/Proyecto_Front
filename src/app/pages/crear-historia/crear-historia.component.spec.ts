import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearHistoriaComponent } from './crear-historia.component';

describe('CrearHistoriaComponent', () => {
  let component: CrearHistoriaComponent;
  let fixture: ComponentFixture<CrearHistoriaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearHistoriaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrearHistoriaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
