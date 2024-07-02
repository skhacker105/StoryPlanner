import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PlayerComponent } from './component/player/player.component';
import { TimeLineComponent } from './component/time-line/time-line.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { TimelineKeyHandlerDirective } from './directives/timeline-key-handler.directive';
import { MatTabsModule } from '@angular/material/tabs';
import { MemberControlComponent } from './component/member-control/member-control.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AddEditMemberComponent } from './component/add-edit-member/add-edit-member.component';
import { MatDialogModule } from '@angular/material/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PopupHeaderComponent } from './component/popup-header/popup-header.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatInputModule } from '@angular/material/input';
import { PictureUploadComponent } from './component/picture-upload/picture-upload.component';
import { ImageIconComponent } from './component/image-icon/image-icon.component';
import { MemberDisplayComponent } from './component/member-display/member-display.component';
import { MatDividerModule } from '@angular/material/divider';
import { ConfirmationDialogComponent } from './component/confirmation-dialog/confirmation-dialog.component';
import { MatRippleModule } from '@angular/material/core';
import { SortPipe } from './pipes/sort.pipe';
import { SortingButtonComponent } from './component/sorting-button/sorting-button.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MemberOptionDisplayComponent } from './component/member-option-display/member-option-display.component';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { SpacePaddedPipe } from './pipes/space-padded.pipe';
import { LayerControlComponent } from './component/layer-control/layer-control.component';
import { LayerDisplayComponent } from './component/layer-display/layer-display.component';
import { LayerPropertiesComponent } from './component/layer-properties/layer-properties.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSliderModule } from '@angular/material/slider';
import { CanvasComponent } from './component/canvas/canvas.component';
import { LayerStyleStringPipe } from './pipes/layer-style-string.pipe';

@NgModule({
  declarations: [
    AppComponent,
    PlayerComponent,
    TimeLineComponent,
    TimelineKeyHandlerDirective,
    AddEditMemberComponent,
    PopupHeaderComponent,
    PictureUploadComponent,
    ImageIconComponent,
    MemberControlComponent,
    MemberDisplayComponent,
    MemberOptionDisplayComponent,
    ConfirmationDialogComponent,
    SortPipe,
    SortingButtonComponent,
    SpacePaddedPipe,
    LayerControlComponent,
    LayerDisplayComponent,
    LayerPropertiesComponent,
    CanvasComponent,
    LayerStyleStringPipe
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    DragDropModule,
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
    MatSliderModule
  ],
  providers: [
    provideAnimationsAsync()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
