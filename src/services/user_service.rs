use rusqlite::{params, Connection};
use argon2::{
    Argon2,
    password_hash::{PasswordHasher, PasswordVerifier, PasswordHash, SaltString},
};
use rand_core::OsRng;
use tauri::AppHandle;
use tauri::Manager;
use uuid::Uuid;
use image::ImageFormat;

use crate::models::user::{DbUser, PublicUser};

/* ===========================
   PASSWORD
=========================== */

fn hash_password(password: &str) -> Result<String, String> {
    let salt = SaltString::generate(&mut OsRng);
    let argon2 = Argon2::default();

    argon2
        .hash_password(password.as_bytes(), &salt)
        .map_err(|e| e.to_string())
        .map(|hash| hash.to_string())
}

fn verify_password(hash: &str, password: &str) -> bool {
    println!("[VERIFY] Incoming password length: {}", password.len());
    println!("[VERIFY] Hash starts with: {}", &hash[..20.min(hash.len())]);

    match PasswordHash::new(hash) {
        Ok(parsed) => {
            let result = Argon2::default()
                .verify_password(password.as_bytes(), &parsed)
                .is_ok();

            println!("[VERIFY] Verification result: {}", result);
            result
        }
        Err(e) => {
            println!("[VERIFY] Failed to parse hash: {:?}", e);
            false
        }
    }
}

/* ===========================
   CREATE USER
=========================== */

pub fn create_user(
    conn: &Connection,
    email: &str,
    password: &str,
) -> Result<PublicUser, String> {

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
    .map_err(|e| e.to_string())?;

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
    conn: &Connection,
    email: &str,
    password: &str,
) -> Result<DbUser, String> {

    println!("[LOGIN] Attempt for email: {}", email);

    let user = match get_user_by_email(conn, email) {
        Some(u) => {
            println!("[LOGIN] User found: id={}", u.id);
            println!("[LOGIN] Stored hash: {}", u.password_hash);
            u
        }
        None => {
            println!("[LOGIN] User NOT found for email: {}", email);
            return Err("Invalid email or password".into());
        }
    };

    let password_ok = verify_password(&user.password_hash, password);

    println!("[LOGIN] Password verification result: {}", password_ok);

    if !password_ok {
        println!("[LOGIN] Password mismatch");
        return Err("Invalid email or password".into());
    }

    println!("[LOGIN] Writing app_session for user_id={}", user.id);

    match conn.execute(
        "INSERT OR REPLACE INTO app_session (id, user_id)
         VALUES (1, ?1)",
        params![user.id],
    ) {
        Ok(_) => println!("[LOGIN] app_session written successfully"),
        Err(e) => {
            println!("[LOGIN] app_session write FAILED: {:?}", e);
            return Err(e.to_string());
        }
    }

    println!("[LOGIN] SUCCESS");

    Ok(user)
}

/* ===========================
   GET USER BY ID
=========================== */

pub fn get_user_by_id(
    conn: &Connection,
    id: i64,
) -> Result<PublicUser, String> {

    let user = get_user_by_id_internal(conn, id)?;
    Ok(user.into())
}

/* ===========================
   UPDATE PROFILE
=========================== */

pub fn update_user_profile(
    conn: &Connection,
    user_id: i64,
    display_name: Option<String>,
    email: Option<String>,
    password: Option<String>,
    current_password: Option<String>,
) -> Result<PublicUser, String> {

    let mut user = get_user_by_id_internal(conn, user_id)?;

    if let Some(name) = display_name {
        user.display_name = Some(name);
    }

    if let Some(new_email) = email {
        user.email = new_email;
    }

    if let Some(new_password) = password {
        let current = current_password
            .ok_or("Current password required")?;

        if !verify_password(&user.password_hash, &current) {
            return Err("Current password incorrect".into());
        }

        user.password_hash = hash_password(&new_password)?;
    }

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
    .map_err(|e| e.to_string())?;

    Ok(user.into())
}

/* ===========================
   LOGOUT
=========================== */

pub fn logout_user(
    conn: &Connection,
) -> Result<(), String> {

    conn.execute("DELETE FROM app_session WHERE id = 1", [])
        .map_err(|e| e.to_string())?;

    Ok(())
}

/* ===========================
   UPLOAD AVATAR
=========================== */

pub fn upload_avatar(
    conn: &Connection,
    app: &AppHandle,
    user_id: i64,
    bytes: Vec<u8>,
) -> Result<String, String> {

    let img = image::load_from_memory(&bytes)
        .map_err(|_| "Invalid image".to_string())?;

    let resized = img.resize(
        256,
        256,
        image::imageops::FilterType::Lanczos3,
    );

    let app_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| e.to_string())?;

    let avatar_dir = app_dir.join("avatars");

    std::fs::create_dir_all(&avatar_dir)
        .map_err(|e| e.to_string())?;

    let filename = format!("{}.webp", Uuid::new_v4());
    let full_path = avatar_dir.join(&filename);

    resized
        .save_with_format(&full_path, ImageFormat::WebP)
        .map_err(|e| e.to_string())?;

    let absolute_path = full_path.to_string_lossy().to_string();

    conn.execute(
        "UPDATE users SET avatar_url = ?1 WHERE id = ?2",
        rusqlite::params![absolute_path, user_id],
    )
    .map_err(|e| e.to_string())?;

    Ok(absolute_path)
}

/* ===========================
   INTERNAL HELPERS
=========================== */

fn get_user_by_id_internal(
    conn: &Connection,
    id: i64,
) -> Result<DbUser, String> {

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
    .map_err(|_| "User not found".into())
}

pub fn get_user_by_email(
    conn: &Connection,
    email: &str,
) -> Option<DbUser> {

    println!("[DB] Searching user by email: {}", email);

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
        Ok(user) => {
            println!("[DB] User found with id={}", user.id);
            Some(user)
        }
        Err(e) => {
            println!("[DB] User lookup failed: {:?}", e);
            None
        }
    }
}