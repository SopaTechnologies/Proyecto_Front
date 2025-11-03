import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RedactarHistoriaComponent } from './redactar-historia.component';

describe('RedactarHistoriaComponent', () => {
  let component: RedactarHistoriaComponent;
  let fixture: ComponentFixture<RedactarHistoriaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RedactarHistoriaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RedactarHistoriaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
