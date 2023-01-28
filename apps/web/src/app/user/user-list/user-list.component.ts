import {Component, OnInit} from '@angular/core';
import {User} from '@stc/types';
import {UserService} from '../user.service';

@Component({
  selector: 'stc-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
})
export class UserListComponent implements OnInit {
  users: User[] = [];

  constructor(
    private userService: UserService,
  ) {
  }

  ngOnInit() {
    this.userService.findAll().subscribe(users => this.users = users);
  }
}
