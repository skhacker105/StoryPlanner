import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PlayerComponent } from './component/_shared/player/player.component';
import { TimeLineComponent } from './component/time-line/time-line.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { KeyHandlerDirective } from './directives/timeline-key-handler.directive';
import { MemberControlComponent } from './component/member-control/member-control.component';
import { AddEditMemberComponent } from './component/member-control/add-edit-member/add-edit-member.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PopupHeaderComponent } from './component/_shared/popup-header/popup-header.component';
import { FileUploadComponent } from './component/_shared/file-upload/file-upload.component';
import { MemberDisplayComponent } from './component/member-control/member-display/member-display.component';
import { ConfirmationDialogComponent } from './component/_shared/confirmation-dialog/confirmation-dialog.component';
import { SortPipe } from './pipes/sort.pipe';
import { SortingButtonComponent } from './component/_shared/sorting-button/sorting-button.component';
import { MemberOptionDisplayComponent } from './component/member-control/member-option-display/member-option-display.component';
import { SpacePaddedPipe } from './pipes/space-padded.pipe';
import { LayerControlComponent } from './component/layer-control/layer-control.component';
import { LayerDisplayComponent } from './component/layer-control/layer-display/layer-display.component';
import { LayerPropertiesComponent } from './component/layer-control/layer-properties/layer-properties.component';
import { CanvasComponent } from './component/canvas/canvas.component';
import { LayerStyleStringPipe } from './pipes/layer-style-string.pipe';
import { StylesComponent } from './component/layer-control/layer-properties/styles/styles.component';
import { AnimationsComponent } from './component/layer-control/layer-properties/animations/animations.component';
import { FormFieldComponent } from './component/_shared/form-field/form-field.component';
import { JSONDiffComponent } from './component/_shared/jsondiff/jsondiff.component';
import { LayerAnimationStringPipe } from './pipes/layer-animation-string.pipe';
import { AllMoviesComponent } from './component/all-movies/all-movies.component';
import { VideoDisplayComponent } from './component/all-movies/video-display/video-display.component';
import { RepeatComponent } from './component/layer-control/layer-properties/repeat/repeat.component';
import { DescriptionToolTipDirective } from './directives/description-tool-tip.directive';
import { DescriptionToolTipComponent } from './component/_shared/description-tool-tip/description-tool-tip.component';
import { AngularMaterialModule } from './modules/angular.material.module';
import { OptionTypeIconPipe } from './pipes/option-type-icon.pipe';
import { ImageIconComponent } from './component/_shared/option-icon/image-icon/image-icon.component';
import { VideoIconComponent } from './component/_shared/option-icon/video-icon/video-icon.component';
import { AudioIconComponent } from './component/_shared/option-icon/audio-icon/audio-icon.component';
import { OptionIconComponent } from './component/_shared/option-icon/option-icon.component';
import { OptionDisplayComponent } from './component/_shared/option-display/option-display.component';
import { ImageDisplayComponent } from './component/_shared/option-display/image-display/image-display.component';
import { AudioDisplayComponent } from './component/_shared/option-display/audio-display/audio-display.component';
import { VidDisplayComponent } from './component/_shared/option-display/video-display/video-display.component';
import { MediaComponent } from './component/layer-control/layer-properties/media/media.component';

@NgModule({
  declarations: [
    AppComponent,
    PlayerComponent,
    TimeLineComponent,
    KeyHandlerDirective,
    AddEditMemberComponent,
    PopupHeaderComponent,
    FileUploadComponent,
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
    DescriptionToolTipComponent,
    OptionTypeIconPipe,
    VideoIconComponent,
    AudioIconComponent,
    OptionIconComponent,
    OptionDisplayComponent,
    ImageDisplayComponent,
    AudioDisplayComponent,
    VidDisplayComponent,
    MediaComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    DragDropModule,
    AngularMaterialModule
  ],
  providers: [
    provideAnimationsAsync()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
