use rusqlite::{params, Connection};
use chrono::Utc;

use crate::models::session::{
    DbSession,
    ActiveSessionResponse,
    FinishedSessionResponse,
    SessionStatus,
};

/* ===========================
   ACTIVE SESSION
=========================== */

pub fn get_active_session(
    conn: &Connection,
    user_id: i64,
) -> Result<Option<ActiveSessionResponse>, String> {

    let result = conn.query_row(
        "SELECT id, project_id, start_time, end_time, description, status
         FROM sessions
         WHERE user_id = ?1 AND status = 'running'
         ORDER BY start_time DESC
         LIMIT 1",
        params![user_id],
        |row| {
            let status_str: String = row.get(5)?;

            let status = match status_str.as_str() {
                "running" => SessionStatus::Running,
                "finished" => SessionStatus::Finished,
                "cancelled" => SessionStatus::Cancelled,
                _ => SessionStatus::Running,
            };

            Ok(ActiveSessionResponse {
                id: row.get(0)?,
                project_id: row.get(1)?,
                start_time: row.get(2)?,
                end_time: row.get(3)?,
                description: row.get(4)?,
                status,
            })
        },
    );

    match result {
        Ok(session) => Ok(Some(session)),
        Err(_) => Ok(None),
    }
}

/* ===========================
   START SESSION
=========================== */

pub fn start_session(
    conn: &Connection,
    user_id: i64,
    project_id: Option<i64>,
) -> Result<ActiveSessionResponse, String> {

    if get_active_session(conn, user_id)?.is_some() {
        return Err("There is already an active session".into());
    }

    let now = Utc::now().to_rfc3339();

    conn.execute(
        "INSERT INTO sessions (user_id, project_id, start_time, status)
         VALUES (?1, ?2, ?3, 'running')",
        params![user_id, project_id, now],
    )
    .map_err(|e| e.to_string())?;

    let id = conn.last_insert_rowid();

    Ok(ActiveSessionResponse {
        id,
        project_id,
        start_time: now,
        end_time: None,
        description: None,
        status: SessionStatus::Running,
    })
}

/* ===========================
   FINALIZE SESSION
=========================== */

pub fn finalize_session(
    conn: &mut Connection,
    user_id: i64,
    session_id: i64,
    description: String,
    tags: Vec<String>,
) -> Result<(), String> {

    let session = get_session_by_id(conn, session_id)?;

    if session.user_id != user_id || session.status != "running" {
        return Err("Invalid session state".into());
    }

    let now = Utc::now().to_rfc3339();

    let tx = conn.transaction().map_err(|e| e.to_string())?;

    tx.execute(
        "UPDATE sessions
         SET status = 'finished',
             end_time = ?1,
             description = ?2
         WHERE id = ?3",
        params![now, description, session_id],
    )
    .map_err(|e| e.to_string())?;

    tx.execute(
        "DELETE FROM session_tags WHERE session_id = ?1",
        params![session_id],
    )
    .map_err(|e| e.to_string())?;

    for tag in tags {
        tx.execute(
            "INSERT INTO session_tags (session_id, tag)
             VALUES (?1, ?2)",
            params![session_id, tag],
        )
        .map_err(|e| e.to_string())?;
    }

    tx.commit().map_err(|e| e.to_string())?;

    Ok(())
}

/* ===========================
   CANCEL SESSION
=========================== */

pub fn cancel_session(
    conn: &Connection,
    user_id: i64,
) -> Result<(), String> {

    conn.execute(
        "UPDATE sessions
         SET status = 'cancelled'
         WHERE user_id = ?1 AND status = 'running'",
        params![user_id],
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}

/* ===========================
   FINISHED SESSIONS
=========================== */

pub fn get_finished_sessions(
    conn: &Connection,
    user_id: i64,
) -> Result<Vec<FinishedSessionResponse>, String> {

    let mut stmt = conn.prepare(
        "SELECT id, project_id, start_time, end_time, description
         FROM sessions
         WHERE user_id = ?1 AND status = 'finished'
         ORDER BY start_time DESC",
    )
    .map_err(|e| e.to_string())?;

    let rows = stmt
        .query_map(params![user_id], |row| {
            Ok((
                row.get::<_, i64>(0)?,
                row.get::<_, Option<i64>>(1)?,
                row.get::<_, String>(2)?,
                row.get::<_, String>(3)?,
                row.get::<_, Option<String>>(4)?,
            ))
        })
        .map_err(|e| e.to_string())?;

    let mut result = Vec::new();

    for r in rows {
        let (id, project_id, start_time, end_time, description) =
            r.map_err(|e| e.to_string())?;

        let mut tag_stmt = conn.prepare(
            "SELECT tag FROM session_tags WHERE session_id = ?1",
        ).map_err(|e| e.to_string())?;

        let tag_rows = tag_stmt
            .query_map(params![id], |row| row.get(0))
            .map_err(|e| e.to_string())?;

        let mut tags = Vec::new();
        for t in tag_rows {
            tags.push(t.map_err(|e| e.to_string())?);
        }

        result.push(FinishedSessionResponse {
            id,
            project_id,
            start_time,
            end_time,
            description,
            tags,
        });
    }

    Ok(result)
}

/* ===========================
   HELPER
=========================== */

fn get_session_by_id(
    conn: &Connection,
    id: i64,
) -> Result<DbSession, String> {

    conn.query_row(
        "SELECT id, user_id, project_id, start_time, end_time, description, status
         FROM sessions WHERE id = ?1",
        params![id],
        |row| {
            Ok(DbSession {
                id: row.get(0)?,
                user_id: row.get(1)?,
                project_id: row.get(2)?,
                start_time: row.get(3)?,
                end_time: row.get(4)?,
                description: row.get(5)?,
                status: row.get(6)?,
            })
        },
    )
    .map_err(|_| "Session not found".into())
}