import {Component, OnInit} from '@angular/core';
import {User} from '@software-tools/types';
import {UserService} from '../user.service';

@Component({
  selector: 'software-tools-user-list',
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
