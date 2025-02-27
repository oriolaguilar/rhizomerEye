import { BrowserModule } from '@angular/platform-browser';
import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { NgbCollapseModule, NgbDropdownModule, NgbModalModule, NgbNavModule, NgbPaginationModule, NgbTypeaheadModule
} from '@ng-bootstrap/ng-bootstrap';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ErrorHandlerModule } from './error-handler/error-handler.module';
import { HttpErrorInterceptor } from './error-handler/http-error-interceptor';
import { Angulartics2Module } from 'angulartics2';

import { LoginBasicModule } from './login-basic/login-basic.module';
import { AuthenticationBasicService } from './login-basic/authentication-basic.service';
import { LoggedInGuard } from './login-basic/loggedin.guard';
import { AdministratorGuard } from './login-basic/administrator.guard';
import { AuthInterceptor } from './login-basic/auth-interceptor';

import { NavbarComponent } from './navbar/navbar.component';
import { AboutComponent } from './about/about.component';
import { BreadcrumbComponent } from './breadcrumb/breadcrumb.component';

import { UserListComponent } from './user/user-list/user-list.component';
import { UserDetailComponent } from './user/user-detail/user-detail.component';
import { UserCreateComponent } from './user/user-create/user-create.component';
import { UserEditComponent } from './user/user-edit/user-edit.component';
import { UserSearchComponent } from './user/user-search/user-search.component';
import { UserService } from './user/user.service';
import { AdminService } from './user/admin.service';

import { ListDatasetComponent } from './dataset/list-dataset/list-dataset.component';
import { ListClassComponent } from './class/list-class/list-class.component';
import { ListFacetComponent } from './facet/list-facet/list-facet.component';
import { DetailDatasetComponent } from './dataset/detail-dataset/detail-dataset.component';
import { DetailClassComponent } from './class/detail-class/detail-class.component';
import { DetailFacetComponent } from './facet/detail-facet/detail-facet.component';
import { DetailRangeComponent } from './range/detail-range/detail-range.component';
import { CreateDatasetComponent } from './dataset/create-dataset/create-dataset.component';
import { EditDatasetComponent } from './dataset/edit-dataset/edit-dataset.component';
import { WordCloudComponent } from './class/word-cloud/word-cloud.component';
import { NetworkComponent } from './class/network/network.component';
import { DatasetFormModalComponent } from './dataset/edit-dataset/dataset-form-modal.component';
import { DescriptionModule } from './description/description.module';
import { ResourceComponent } from './resource/resource.component';
import { DetailIncomingFacetComponent } from './facet/detail-incoming-facet/detail-incoming-facet.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { ChartRepresentationComponent } from './facet/chart-representation/chart-representation.component';
import { GoogleChartsModule } from 'angular-google-charts';


@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    AboutComponent,
    UserListComponent,
    UserDetailComponent,
    UserCreateComponent,
    UserEditComponent,
    UserSearchComponent,
    BreadcrumbComponent,
    ListDatasetComponent,
    ListClassComponent,
    ListFacetComponent,
    DetailDatasetComponent,
    DetailClassComponent,
    DetailFacetComponent,
    DetailRangeComponent,
    CreateDatasetComponent,
    EditDatasetComponent,
    WordCloudComponent,
    NetworkComponent,
    DatasetFormModalComponent,
    ResourceComponent,
    DetailIncomingFacetComponent,
    ChartRepresentationComponent
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    FormsModule,
    HttpClientModule,
    NgbCollapseModule,
    NgbDropdownModule,
    NgbPaginationModule,
    NgbTypeaheadModule,
    NgbModalModule,
    NgbNavModule,
    Angulartics2Module.forRoot(),
    LoginBasicModule,
    ErrorHandlerModule,
    DescriptionModule,
    GoogleChartsModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production })
  ],
  providers: [
    {provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true},
    {provide: HTTP_INTERCEPTORS, useClass: HttpErrorInterceptor, multi: true},
    AuthenticationBasicService, LoggedInGuard, AdministratorGuard, AdminService, UserService
  ],
  bootstrap: [AppComponent],
  entryComponents: [DatasetFormModalComponent],
  schemas: [NO_ERRORS_SCHEMA]
})
export class AppModule { }
