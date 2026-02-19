use rusqlite::params;
use crate::db::get_db;
use crate::models::user::{DbUser, PublicUser};
use tauri::State;
use crate::state::AppState;

use argon2::{
    Argon2,
    password_hash::{PasswordHasher, PasswordVerifier, PasswordHash, SaltString},
};
use rand_core::OsRng;

use tauri::AppHandle;
use tauri::Manager;

/* ===========================
   PASSWORD
=========================== */

fn hash_password(password: &str) -> Result<String, String> {
    let salt = SaltString::generate(&mut OsRng);
    let argon2 = Argon2::default();

    argon2
        .hash_password(password.as_bytes(), &salt)
        .map_err(|e| {
            eprintln!("[HASH_PASSWORD_ERROR] {:?}", e);
            e.to_string()
        })
        .map(|hash| hash.to_string())
}

fn verify_password(hash: &str, password: &str) -> bool {
    match PasswordHash::new(hash) {
        Ok(parsed) => Argon2::default()
            .verify_password(password.as_bytes(), &parsed)
            .is_ok(),
        Err(e) => {
            eprintln!("[VERIFY_PASSWORD_PARSE_ERROR] {:?}", e);
            false
        }
    }
}

/* ===========================
   CREATE USER
=========================== */

pub fn create_user(email: &str, password: &str) -> Result<PublicUser, String> {
    let db = get_db();
    let conn = db.lock().unwrap();

    let password_hash = hash_password(password)?;

    let display_name = email
        .split("@")
        .next()
        .unwrap_or("user")
        .to_string();

    conn.execute(
        "INSERT INTO users (email, password_hash, display_name)
         VALUES (?1, ?2, ?3)",
        params![email, password_hash, display_name],
    )
    .map_err(|e| {
        eprintln!("[CREATE_USER_DB_ERROR] {:?}", e);
        e.to_string()
    })?;

    let id = conn.last_insert_rowid();

    Ok(PublicUser {
        id,
        email: email.to_string(),
        display_name: Some(display_name),
        avatar_url: None,
        email_verified: false,
    })
}

/* ===========================
   LOGIN
=========================== */

pub fn login_user(
    state: State<AppState>,
    email: &str,
    password: &str,
) -> Result<PublicUser, String> {

    let user = get_user_by_email(email)
        .ok_or_else(|| {
            eprintln!("[LOGIN_ERROR] User not found: {}", email);
            "Invalid email or password".to_string()
        })?;

    if !verify_password(&user.password_hash, password) {
        eprintln!("[LOGIN_ERROR] Invalid password for user: {}", email);
        return Err("Invalid email or password".into());
    }

    let mut current = state.current_user_id.lock().unwrap();
    *current = Some(user.id);

    let db = get_db();
    let conn = db.lock().unwrap();

    conn.execute(
        "INSERT OR REPLACE INTO app_session (id, user_id)
        VALUES (1, ?1)",
        params![user.id],
    )
    .map_err(|e| e.to_string())?;

    Ok(user.into())
}

/* ===========================
   GET USER BY ID
=========================== */

pub fn get_user_by_id(id: i64) -> Result<PublicUser, String> {
    let user = get_user_by_id_internal(id)?;
    Ok(user.into())
}

/* ===========================
   UPDATE PROFILE
=========================== */

pub fn update_user_profile_internal(
    user_id: i64,
    display_name: Option<String>,
    email: Option<String>,
    password: Option<String>,
    current_password: Option<String>,
) -> Result<PublicUser, String> {

    eprint!("[UPDATE_PROFILE] user_id={}, display_name={:?}, email={:?}, password_set={}, current_password_set={}",
        user_id,
        display_name,
        email,
        password.is_some(),
        current_password.is_some()
    );

    let mut user = get_user_by_id_internal(user_id)?;

    if let Some(name) = display_name {
        user.display_name = Some(name);
    }

    if let Some(new_email) = email {
        user.email = new_email;
    }

    if let Some(new_password) = password {
        let current = current_password
            .ok_or_else(|| {
                eprintln!("[UPDATE_PROFILE_ERROR] Missing current password");
                "Current password required".to_string()
            })?;

        if !verify_password(&user.password_hash, &current) {
            eprintln!("[UPDATE_PROFILE_ERROR] Incorrect current password");
            return Err("Current password incorrect".into());
        }

        let new_hash = hash_password(&new_password)?;
        user.password_hash = new_hash;
    }

    let db = get_db();
    let conn = db.lock().unwrap();

    conn.execute(
        "UPDATE users
         SET email = ?1,
             password_hash = ?2,
             display_name = ?3
         WHERE id = ?4",
        params![
            user.email,
            user.password_hash,
            user.display_name,
            user_id
        ],
    )
    .map_err(|e| {
        eprintln!("[UPDATE_PROFILE_DB_ERROR] {:?}", e);
        e.to_string()
    })?;

    Ok(user.into())
}

/* ===========================
   AVATAR UPLOAD
=========================== */




pub fn upload_avatar_internal(
    app: AppHandle,
    user_id: i64,
    bytes: Vec<u8>,
) -> Result<String, String> {

    let img = image::load_from_memory(&bytes)
        .map_err(|e| {
            println!("AVATAR ERROR: invalid image: {:?}", e);
            "Invalid image".to_string()
        })?;

    let resized = img.resize(
        256,
        256,
        image::imageops::FilterType::Lanczos3,
    );

    // 📁 Obtener carpeta AppData (Tauri v2)
    let app_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| {
            println!("AVATAR ERROR: failed to get app_data_dir: {:?}", e);
            e.to_string()
        })?;

    let avatar_dir = app_dir.join("avatars");

    std::fs::create_dir_all(&avatar_dir)
        .map_err(|e| {
            println!("AVATAR ERROR: create_dir_all: {:?}", e);
            e.to_string()
        })?;

    let filename = format!("{}.webp", uuid::Uuid::new_v4());
    let full_path = avatar_dir.join(&filename);

    resized
        .save_with_format(&full_path, image::ImageFormat::WebP)
        .map_err(|e| {
            println!("AVATAR ERROR: save file: {:?}", e);
            e.to_string()
        })?;

    let absolute_path = full_path.to_string_lossy().to_string();

    let db = get_db();
    let conn = db.lock().unwrap();

    conn.execute(
        "UPDATE users SET avatar_url = ?1 WHERE id = ?2",
        rusqlite::params![absolute_path, user_id],
    )
    .map_err(|e| {
        println!("AVATAR ERROR: db update: {:?}", e);
        e.to_string()
    })?;

    println!("AVATAR SAVED AT: {}", absolute_path);

    Ok(absolute_path)
}

/* ===========================
   LOGOUT
=========================== */

pub fn logout_user(state: State<AppState>) -> Result<(), String> {
    // 🔥 Limpiar memoria
    {
        let mut current = state.current_user_id.lock().unwrap();
        *current = None;
    }

    // 🔥 Limpiar persistencia
    let db = get_db();
    let conn = db.lock().unwrap();

    conn.execute("DELETE FROM app_session WHERE id = 1", [])
        .map_err(|e| {
            eprintln!("[LOGOUT_DB_ERROR] {:?}", e);
            e.to_string()
        })?;

    println!("[LOGOUT] Session cleared");

    Ok(())
}

/* ===========================
   INTERNAL HELPERS
=========================== */

fn get_user_by_id_internal(id: i64) -> Result<DbUser, String> {
    let db = get_db();
    let conn = db.lock().unwrap();

    conn.query_row(
        "SELECT id, email, password_hash, display_name, avatar_url, email_verified
         FROM users WHERE id = ?1",
        params![id],
        |row| {
            Ok(DbUser {
                id: row.get(0)?,
                email: row.get(1)?,
                password_hash: row.get(2)?,
                display_name: row.get(3)?,
                avatar_url: row.get(4)?,
                email_verified: row.get(5)?,
            })
        },
    )
    .map_err(|e| {
        eprintln!("[GET_USER_BY_ID_ERROR] {:?}", e);
        "User not found".to_string()
    })
}

pub fn get_user_by_email(email: &str) -> Option<DbUser> {
    let db = get_db();
    let conn = db.lock().unwrap();

    match conn.query_row(
        "SELECT id, email, password_hash, display_name, avatar_url, email_verified
         FROM users WHERE email = ?1",
        params![email],
        |row| {
            Ok(DbUser {
                id: row.get(0)?,
                email: row.get(1)?,
                password_hash: row.get(2)?,
                display_name: row.get(3)?,
                avatar_url: row.get(4)?,
                email_verified: row.get(5)?,
            })
        },
    ) {
        Ok(user) => Some(user),
        Err(e) => {
            eprintln!("[GET_USER_BY_EMAIL_ERROR] {:?}", e);
            None
        }
    }
}