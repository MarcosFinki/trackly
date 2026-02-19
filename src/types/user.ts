export interface PublicUser {
  id: number;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  emailVerified?: boolean;
}