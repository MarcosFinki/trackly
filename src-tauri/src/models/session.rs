use serde::Serialize;

/* ===========================
   DB MODEL (INTERNO)
=========================== */

#[derive(Debug)]
#[allow(dead_code)] // Suppress warnings for unused fields
pub struct DbSession {
    pub id: i64,
    pub user_id: i64,
    pub project_id: Option<i64>,
    pub start_time: String,
    pub end_time: Option<String>,
    pub description: Option<String>,
    pub status: String,
}

/* ===========================
   RESPONSE MODELS (API)
=========================== */

#[derive(Serialize)]
#[serde(rename_all = "lowercase")]
pub enum SessionStatus {
    Running,
    Finished,
    Cancelled,
}

#[derive(Serialize)]
pub struct ActiveSessionResponse {
    pub id: i64,
    pub project_id: Option<i64>,
    pub start_time: String,
    pub end_time: Option<String>,
    pub description: Option<String>,
    pub status: SessionStatus,
}

#[derive(Serialize)]
pub struct FinishedSessionResponse {
    pub id: i64,
    pub project_id: Option<i64>,
    pub start_time: String,
    pub end_time: String,
    pub description: Option<String>,
    pub tags: Vec<String>,
}