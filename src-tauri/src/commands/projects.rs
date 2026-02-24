use tauri::{command, State};
use serde::Deserialize;

use crate::state::AppState;
use crate::db::Database;
use crate::services::project_service;

#[derive(Deserialize)]
pub struct CreateProjectInput {
    pub name: String,
    pub color: String,
}

#[derive(Deserialize)]
pub struct UpdateProjectInput {
    pub id: i64,
    pub name: Option<String>,
    pub color: Option<String>,
}

#[command]
pub fn get_projects(
    state: State<AppState>,
    db: State<Database>,
) -> Result<Vec<crate::models::project::Project>, String> {

    let user_id = state
        .current_user_id
        .lock()
        .unwrap()
        .ok_or("Not authenticated")?;

    let conn = db.conn.lock().unwrap();

    project_service::get_projects(&conn, user_id)
}

#[command]
pub fn create_project(
    state: State<AppState>,
    db: State<Database>,
    input: CreateProjectInput,
) -> Result<crate::models::project::Project, String> {

    let user_id = state
        .current_user_id
        .lock()
        .unwrap()
        .ok_or("Not authenticated")?;

    let conn = db.conn.lock().unwrap();

    project_service::create_project(&conn, user_id, &input.name, &input.color)
}

#[command]
pub fn update_project(
    state: State<AppState>,
    db: State<Database>,
    input: UpdateProjectInput,
) -> Result<(), String> {

    let user_id = state
        .current_user_id
        .lock()
        .unwrap()
        .ok_or("Not authenticated")?;

    let conn = db.conn.lock().unwrap();

    project_service::update_project(
        &conn,
        user_id,
        input.id,
        input.name,
        input.color,
    )
}

#[command]
pub fn delete_project(
    state: State<AppState>,
    db: State<Database>,
    id: i64,
) -> Result<(), String> {

    let user_id = state
        .current_user_id
        .lock()
        .unwrap()
        .ok_or("Not authenticated")?;

    let conn = db.conn.lock().unwrap();

    project_service::delete_project(&conn, user_id, id)
}