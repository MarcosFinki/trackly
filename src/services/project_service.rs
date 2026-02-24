use rusqlite::{params, Connection};
use crate::models::project::{DbProject, Project};

/* ===========================
   GET PROJECTS
=========================== */

pub fn get_projects(
    conn: &Connection,
    user_id: i64,
) -> Result<Vec<Project>, String> {

    let mut stmt = conn.prepare(
        "SELECT id, user_id, name, color
         FROM projects
         WHERE user_id = ?1
         ORDER BY created_at ASC"
    ).map_err(|e| e.to_string())?;

    let rows = stmt
        .query_map(params![user_id], |row| {
            Ok(DbProject {
                id: row.get(0)?,
                user_id: row.get(1)?,
                name: row.get(2)?,
                color: row.get(3)?,
            })
        })
        .map_err(|e| e.to_string())?;

    let mut projects = Vec::new();

    for row in rows {
        projects.push(row.map_err(|e| e.to_string())?.into());
    }

    Ok(projects)
}

/* ===========================
   CREATE PROJECT
=========================== */

pub fn create_project(
    conn: &Connection,
    user_id: i64,
    name: &str,
    color: &str,
) -> Result<Project, String> {

    conn.execute(
        "INSERT INTO projects (user_id, name, color)
         VALUES (?1, ?2, ?3)",
        params![user_id, name, color],
    )
    .map_err(|e| e.to_string())?;

    let id = conn.last_insert_rowid();

    Ok(Project {
        id,
        name: name.to_string(),
        color: color.to_string(),
    })
}

/* ===========================
   UPDATE PROJECT
=========================== */

pub fn update_project(
    conn: &Connection,
    user_id: i64,
    project_id: i64,
    name: Option<String>,
    color: Option<String>,
) -> Result<(), String> {

    let mut fields = Vec::new();
    let mut values: Vec<&dyn rusqlite::ToSql> = Vec::new();

    if let Some(ref n) = name {
        fields.push("name = ?");
        values.push(n);
    }

    if let Some(ref c) = color {
        fields.push("color = ?");
        values.push(c);
    }

    if fields.is_empty() {
        return Ok(());
    }

    let sql = format!(
        "UPDATE projects SET {} WHERE id = ? AND user_id = ?",
        fields.join(", ")
    );

    let mut stmt = conn.prepare(&sql).map_err(|e| e.to_string())?;

    let mut final_values = values;
    final_values.push(&project_id);
    final_values.push(&user_id);

    let result = stmt.execute(rusqlite::params_from_iter(final_values))
        .map_err(|e| e.to_string())?;

    if result == 0 {
        return Err("Project not found".into());
    }

    Ok(())
}

/* ===========================
   DELETE PROJECT
=========================== */

pub fn delete_project(
    conn: &Connection,
    user_id: i64,
    project_id: i64,
) -> Result<(), String> {

    let result = conn.execute(
        "DELETE FROM projects WHERE id = ?1 AND user_id = ?2",
        params![project_id, user_id],
    )
    .map_err(|e| e.to_string())?;

    if result == 0 {
        return Err("Project not found".into());
    }

    Ok(())
}