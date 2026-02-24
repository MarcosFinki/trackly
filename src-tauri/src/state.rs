use std::sync::Mutex;

#[derive(Default)]
pub struct AppState {
    pub current_user_id: Mutex<Option<i64>>,
}