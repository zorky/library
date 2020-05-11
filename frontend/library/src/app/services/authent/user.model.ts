export interface User {
  id: number;
  username?: string;
  email?: string;
  permissions?: string [];
  is_superuser?: boolean;
  is_staff?: boolean;
  first_name?: string;
  last_name?: string;
}
