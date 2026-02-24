use serde::Serialize;

#[derive(Debug)]
pub struct DbUser {
    pub id: i64,
    pub email: String,
    pub password_hash: String,
    pub display_name: Option<String>,
    pub avatar_url: Option<String>,
    pub email_verified: i64,
}

#[derive(Serialize)]
pub struct PublicUser {
    pub id: i64,
    pub email: String,
    pub display_name: Option<String>,
    pub avatar_url: Option<String>,
    pub email_verified: bool,
}

impl From<DbUser> for PublicUser {
    fn from(user: DbUser) -> Self {
        Self {
            id: user.id,
            email: user.email,
            display_name: user.display_name,
            avatar_url: user.avatar_url,
            email_verified: user.email_verified == 1,
        }
    }
}