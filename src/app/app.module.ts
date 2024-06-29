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
import { LayerControlComponent } from './component/layer-control/layer-control.component';
import { SaveLoadControlComponent } from './component/save-load-control/save-load-control.component';
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

@NgModule({
  declarations: [
    AppComponent,
    PlayerComponent,
    TimeLineComponent,
    TimelineKeyHandlerDirective,
    LayerControlComponent,
    SaveLoadControlComponent,
    AddEditMemberComponent,
    PopupHeaderComponent,
    PictureUploadComponent,
    ImageIconComponent,
    MemberDisplayComponent,
    ConfirmationDialogComponent
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
    MatDividerModule
  ],
  providers: [
    provideAnimationsAsync()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
