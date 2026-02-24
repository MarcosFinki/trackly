use tauri::{command, State};
use crate::state::AppState;
use crate::db::Database;
use crate::services::session_service;
use crate::models::session::{
    ActiveSessionResponse,
    FinishedSessionResponse,
};

#[command]
pub fn get_active_session(
    state: State<AppState>,
    db: State<Database>,
) -> Result<Option<ActiveSessionResponse>, String> {

    let user_id = state
        .current_user_id
        .lock()
        .unwrap()
        .ok_or("Not authenticated")?;

    let conn = db.conn.lock().unwrap();

    session_service::get_active_session(&conn, user_id)
}

#[command]
pub fn start_session(
    state: State<AppState>,
    db: State<Database>,
    project_id: Option<i64>,
) -> Result<ActiveSessionResponse, String> {

    let user_id = state
        .current_user_id
        .lock()
        .unwrap()
        .ok_or("Not authenticated")?;

    let conn = db.conn.lock().unwrap();

    session_service::start_session(&conn, user_id, project_id)
}

#[command]
pub fn finalize_session(
    state: State<AppState>,
    db: State<Database>,
    session_id: i64,
    description: String,
    tags: Vec<String>,
) -> Result<(), String> {

    let user_id = state
        .current_user_id
        .lock()
        .unwrap()
        .ok_or("Not authenticated")?;

    let mut conn = db.conn.lock().unwrap();

    session_service::finalize_session(
        &mut conn,
        user_id,
        session_id,
        description,
        tags,
    )
}

#[command]
pub fn cancel_session(
    state: State<AppState>,
    db: State<Database>,
) -> Result<(), String> {

    let user_id = state
        .current_user_id
        .lock()
        .unwrap()
        .ok_or("Not authenticated")?;

    let conn = db.conn.lock().unwrap();

    session_service::cancel_session(&conn, user_id)
}

#[command]
pub fn get_finished_sessions(
    state: State<AppState>,
    db: State<Database>,
) -> Result<Vec<FinishedSessionResponse>, String> {

    let user_id = state
        .current_user_id
        .lock()
        .unwrap()
        .ok_or("Not authenticated")?;

    let conn = db.conn.lock().unwrap();

    session_service::get_finished_sessions(&conn, user_id)
}