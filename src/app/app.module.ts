import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PlayerComponent } from './component/_shared/player/player.component';
import { TimeLineComponent } from './component/time-line/time-line.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { TimelineKeyHandlerDirective } from './directives/timeline-key-handler.directive';
import { MatTabsModule } from '@angular/material/tabs';
import { MemberControlComponent } from './component/member-control/member-control.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AddEditMemberComponent } from './component/member-control/add-edit-member/add-edit-member.component';
import { MatDialogModule } from '@angular/material/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PopupHeaderComponent } from './component/_shared/popup-header/popup-header.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatInputModule } from '@angular/material/input';
import { PictureUploadComponent } from './component/_shared/picture-upload/picture-upload.component';
import { ImageIconComponent } from './component/_shared/image-icon/image-icon.component';
import { MemberDisplayComponent } from './component/member-control/member-display/member-display.component';
import { MatDividerModule } from '@angular/material/divider';
import { ConfirmationDialogComponent } from './component/_shared/confirmation-dialog/confirmation-dialog.component';
import { MatRippleModule } from '@angular/material/core';
import { SortPipe } from './pipes/sort.pipe';
import { SortingButtonComponent } from './component/_shared/sorting-button/sorting-button.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MemberOptionDisplayComponent } from './component/member-control/member-option-display/member-option-display.component';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { SpacePaddedPipe } from './pipes/space-padded.pipe';
import { LayerControlComponent } from './component/layer-control/layer-control.component';
import { LayerDisplayComponent } from './component/layer-control/layer-display/layer-display.component';
import { LayerPropertiesComponent } from './component/layer-control/layer-properties/layer-properties.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSliderModule } from '@angular/material/slider';
import { CanvasComponent } from './component/canvas/canvas.component';
import { LayerStyleStringPipe } from './pipes/layer-style-string.pipe';
import { StylesComponent } from './component/layer-control/layer-properties/styles/styles.component';
import { AnimationsComponent } from './component/layer-control/layer-properties/animations/animations.component';
import { FormFieldComponent } from './component/_shared/form-field/form-field.component';
import { JSONDiffComponent } from './component/_shared/jsondiff/jsondiff.component';
import { LayerAnimationStringPipe } from './pipes/layer-animation-string.pipe';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AllMoviesComponent } from './component/all-movies/all-movies.component';
import { VideoDisplayComponent } from './component/all-movies/video-display/video-display.component';
import { RepeatComponent } from './component/layer-control/layer-properties/repeat/repeat.component';
import { DescriptionToolTipDirective } from './directives/description-tool-tip.directive';
import { DescriptionToolTipComponent } from './component/_shared/description-tool-tip/description-tool-tip.component';

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
    LayerStyleStringPipe,
    StylesComponent,
    AnimationsComponent,
    FormFieldComponent,
    JSONDiffComponent,
    LayerAnimationStringPipe,
    AllMoviesComponent,
    VideoDisplayComponent,
    RepeatComponent,
    DescriptionToolTipDirective,
    DescriptionToolTipComponent
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
    MatSliderModule,
    MatProgressSpinnerModule
  ],
  providers: [
    provideAnimationsAsync()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
