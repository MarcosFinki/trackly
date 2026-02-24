// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod db;
mod models;
mod services;
mod commands;
mod state;

use std::sync::Mutex;
use state::AppState;

/* ===========================
   AUTH COMMANDS
=========================== */

use commands::auth::{
    register_user,
    login,
    get_current_user,
    update_user_profile,
    upload_avatar,
    logout_user_command,
};

/* ===========================
   PROJECT COMMANDS
=========================== */

use commands::projects::{
    get_projects,
    create_project,
    update_project,
    delete_project,
};

/* ===========================
   SESSION COMMANDS
=========================== */

use commands::sessions::{
    get_active_session,
    start_session,
    finalize_session,
    cancel_session,
    get_finished_sessions,
};
use tauri::Manager;

fn main() {
    tauri::Builder::default()
        .manage(AppState {
            current_user_id: Mutex::new(None),
        })
        .setup(|app| {
            // Inicializar base de datos en el directorio correcto del sistema
            let database = crate::db::Database::new(&app.handle());
            app.manage(database);

            // Restaurar sesión si existe
            let state = app.state::<AppState>();

            let db = app.state::<crate::db::Database>();
            let conn = db.conn.lock().unwrap();

            let result: Result<i64, _> = conn.query_row(
                "SELECT user_id FROM app_session WHERE id = 1",
                [],
                |row| row.get(0),
            );

            match result {
                Ok(user_id) => {
                    let mut current = state.current_user_id.lock().unwrap();
                    *current = Some(user_id);
                    println!("SESSION RESTORED FOR USER {}", user_id);
                }
                Err(_) => {
                    println!("NO PREVIOUS SESSION FOUND");
                }
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // AUTH
            register_user,
            login,
            get_current_user,
            update_user_profile,
            upload_avatar,
            logout_user_command,

            // PROJECTS
            get_projects,
            create_project,
            update_project,
            delete_project,

            // SESSIONS
            get_active_session,
            start_session,
            finalize_session,
            cancel_session,
            get_finished_sessions,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri app");
}