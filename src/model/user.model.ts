export class UserResponse {
  id: string;
  username: string;
  name: string;
}

export class UserUpdateRequest {
  username: string;
  password: string;
  confirmPassword: string;
  name: string;
}
