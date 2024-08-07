import { NgModule } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { MatRippleModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSliderModule } from '@angular/material/slider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ScrollingModule } from '@angular/cdk/scrolling';

@NgModule({
  imports: [
    MatTabsModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatToolbarModule,
    MatInputModule,
    MatDividerModule,
    MatRippleModule,
    MatTooltipModule,
    MatButtonToggleModule,
    MatCheckboxModule,
    MatSliderModule,
    MatProgressSpinnerModule,
    ScrollingModule
  ],
  exports: [
    MatTabsModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatToolbarModule,
    MatInputModule,
    MatDividerModule,
    MatRippleModule,
    MatTooltipModule,
    MatButtonToggleModule,
    MatCheckboxModule,
    MatSliderModule,
    MatProgressSpinnerModule,
    ScrollingModule
  ]
})
export class AngularMaterialModule { }
