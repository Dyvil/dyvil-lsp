import {CommonModule} from '@angular/common';
import {HttpClientModule} from '@angular/common/http';
import {NgModule} from '@angular/core';
import {UserListComponent} from './user-list/user-list.component';
import {UserRoutingModule} from './user-routing.module';
import {UserService} from './user.service';

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    UserRoutingModule,
  ],
  declarations: [UserListComponent],
  providers: [UserService],
})
export class UserModule {
}
