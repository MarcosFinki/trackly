use tauri::{command, State};
use serde::Deserialize;

use crate::state::AppState;
use crate::services::user_service::{
    create_user,
    login_user,
    get_user_by_id,
    update_user_profile_internal,
    upload_avatar_internal,
    logout_user,
};
use crate::models::user::PublicUser;

/* ===========================
   INPUT TYPES
=========================== */

#[derive(Deserialize)]
pub struct RegisterInput {
    pub email: String,
    pub password: String,
}

#[derive(Deserialize)]
pub struct LoginInput {
    pub email: String,
    pub password: String,
}

#[derive(Deserialize)]
pub struct UpdateProfileInput {
    pub display_name: Option<String>,
    pub email: Option<String>,
    pub password: Option<String>,
    pub current_password: Option<String>,
}

/* ===========================
   REGISTER
=========================== */

#[command]
pub fn register_user(
    input: RegisterInput,
) -> Result<PublicUser, String> {

    if input.password.len() < 6 {
        return Err("Password too short".into());
    }

    create_user(
        &input.email.trim().to_lowercase(),
        &input.password,
    )
}

/* ===========================
   LOGIN
=========================== */

#[command]
pub fn login(
    state: State<AppState>,
    input: LoginInput,
) -> Result<PublicUser, String> {

    login_user(
        state,
        &input.email.trim().to_lowercase(),
        &input.password,
    )
}

/* ===========================
   GET CURRENT USER
=========================== */

#[command]
pub fn get_current_user(
    state: State<AppState>,
) -> Result<PublicUser, String> {

    let current = state.current_user_id.lock().unwrap();

    let user_id = match *current {
        Some(id) => id,
        None => return Err("Not authenticated".into()),
    };

    get_user_by_id(user_id)
}

/* ===========================
   UPDATE PROFILE
=========================== */

#[command]
pub fn update_user_profile(
    state: State<AppState>,
    input: UpdateProfileInput,
) -> Result<PublicUser, String> {

    let current = state.current_user_id.lock().unwrap();

    let user_id = match *current {
        Some(id) => id,
        None => return Err("Not authenticated".into()),
    };

    update_user_profile_internal(
        user_id,
        input.display_name,
        input.email.map(|e| e.trim().to_lowercase()),
        input.password,
        input.current_password,
    )
}

/* ===========================
   AVATAR UPLOAD
=========================== */

#[command]
pub fn upload_avatar(
    app: tauri::AppHandle,
    state: State<AppState>,
    bytes: Vec<u8>,
) -> Result<String, String> {

    let current = state.current_user_id.lock().unwrap();

    let user_id = match *current {
        Some(id) => id,
        None => return Err("Not authenticated".into()),
    };

    upload_avatar_internal(app, user_id, bytes)
}

/* ===========================
   LOGOUT
=========================== */

#[command]
pub fn logout_user_command(
    state: State<AppState>,
) -> Result<(), String> {
    logout_user(state)
}