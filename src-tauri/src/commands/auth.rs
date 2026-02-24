use tauri::{command, State};
use serde::Deserialize;

use crate::state::AppState;
use crate::db::Database;
use crate::services::user_service;
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
    db: State<Database>,
    input: RegisterInput,
) -> Result<PublicUser, String> {

    if input.password.len() < 6 {
        return Err("Password too short".into());
    }

    let conn = db.conn.lock().unwrap();

    user_service::create_user(
        &conn,
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
    db: State<Database>,
    input: LoginInput,
) -> Result<PublicUser, String> {

    let conn = db.conn.lock().unwrap();

    let user = user_service::login_user(
        &conn,
        &input.email.trim().to_lowercase(),
        &input.password,
    )?;

    {
        let mut current = state.current_user_id.lock().unwrap();
        *current = Some(user.id);
    }

    Ok(user.into())
}

/* ===========================
   GET CURRENT USER
=========================== */

#[command]
pub fn get_current_user(
    state: State<AppState>,
    db: State<Database>,
) -> Result<PublicUser, String> {

    let user_id = state
        .current_user_id
        .lock()
        .unwrap()
        .ok_or("Not authenticated")?;

    let conn = db.conn.lock().unwrap();

    user_service::get_user_by_id(&conn, user_id)
}

/* ===========================
   UPDATE PROFILE
=========================== */

#[command]
pub fn update_user_profile(
    state: State<AppState>,
    db: State<Database>,
    input: UpdateProfileInput,
) -> Result<PublicUser, String> {

    let user_id = state
        .current_user_id
        .lock()
        .unwrap()
        .ok_or("Not authenticated")?;

    let conn = db.conn.lock().unwrap();

    user_service::update_user_profile(
        &conn,
        user_id,
        input.display_name,
        input.email.map(|e| e.trim().to_lowercase()),
        input.password,
        input.current_password,
    )
}

/* ===========================
   LOGOUT
=========================== */

#[command]
pub fn logout_user_command(
    state: State<AppState>,
    db: State<Database>,
) -> Result<(), String> {


    let conn = db.conn.lock().unwrap();

    user_service::logout_user(&conn)?;

    {
        let mut current = state.current_user_id.lock().unwrap();
        *current = None;
    }


    Ok(())
}

/* ===========================
   UPLOAD AVATAR
=========================== */

#[command]
pub fn upload_avatar(
    app: tauri::AppHandle,
    state: State<AppState>,
    db: State<Database>,
    bytes: Vec<u8>,
) -> Result<String, String> {

    let user_id = state
        .current_user_id
        .lock()
        .unwrap()
        .ok_or("Not authenticated")?;

    let conn = db.conn.lock().unwrap();

    user_service::upload_avatar(
        &conn,
        &app,
        user_id,
        bytes,
    )
}