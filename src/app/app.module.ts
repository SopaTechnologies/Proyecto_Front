
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { PersonajesComponent } from './pages/personajes/personajes.component';
import { AppLayoutComponent } from './components/app-layout/app-layout.component';
import { routes } from './app.routes';

@NgModule({
  declarations: [
    PersonajesComponent,
    AppLayoutComponent,
    // Otros componentes
  ],
  imports: [
    BrowserModule,
    FormsModule,
    CommonModule,
    HttpClientModule,
    RouterModule.forRoot(routes)
  ],
  providers: [],
  bootstrap: [AppLayoutComponent]
})
export class AppModule {}
