import type { PublicUserDTO } from "../../types/user.dto";
import type { PublicUser } from "../../types/user";

export function adaptUserFromApi(
  dto: PublicUserDTO
): PublicUser {
  return {
    id: dto.id,
    email: dto.email,
    displayName: dto.display_name,
    avatarUrl: dto.avatar_url,
    emailVerified: dto.email_verified,
  };
}