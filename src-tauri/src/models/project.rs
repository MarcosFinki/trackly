use serde::Serialize;

#[derive(Debug)]
pub struct DbProject {
    pub id: i64,
    #[allow(dead_code)]
    pub user_id: i64,
    pub name: String,
    pub color: String,
}

#[derive(Serialize)]
pub struct Project {
    pub id: i64,
    pub name: String,
    pub color: String,
}

impl From<DbProject> for Project {
    fn from(p: DbProject) -> Self {
        Project {
            id: p.id,
            name: p.name,
            color: p.color,
        }
    }
}