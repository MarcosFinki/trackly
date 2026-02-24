export interface PublicUserDTO {
  id: number;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  email_verified?: boolean;
}