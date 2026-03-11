export interface RoleInfo {
  roleName: string;
  shortRoleName: string;
  positions: string[];
}

export interface RoleGroup {
  [generalPosition: string]: RoleInfo[];
}
