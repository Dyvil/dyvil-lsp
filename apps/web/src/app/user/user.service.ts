import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import type {CreateUserDto, UserDto} from '@software-tools/types';
import {environment} from '../../environments/environment';

const baseUrl = environment.apiUrl + '/user';

@Injectable()
export class UserService {

  constructor(
    private http: HttpClient,
  ) {
  }

  create(dto: CreateUserDto) {
    return this.http.post<UserDto>(baseUrl, dto);
  }

  findAll() {
    return this.http.get<UserDto[]>(baseUrl);
  }

  findOne(id: string) {
    return this.http.get<UserDto>(`${baseUrl}/${id}`);
  }

  update(id: string, dto: CreateUserDto) {
    return this.http.patch<UserDto>(`${baseUrl}/${id}`, dto);
  }

  remove(id: string) {
    return this.http.delete<UserDto>(`${baseUrl}/${id}`);
  }
}
