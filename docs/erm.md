```mermaid
erDiagram
    %% ───────────────────────────────────────────
    %%  Core User & Role
    %% ───────────────────────────────────────────
    USER {
        int id PK
        string email "unique"
        string password_hash
        string nickname
        boolean is_verified
        datetime created_at
        datetime deleted_at
    }

    ROLE {
        int id PK
        string name
        string description
    }

    USER_ROLES {
        int user_id PK FK
        int role_id PK FK
        datetime granted_at
    }

    WALLET {
        int user_id PK FK
        int wisecoins
        datetime updated_at
    }

    REFRESH_TOKEN {
        int id PK
        int user_id FK
        string token_hash
        datetime issued_at
        datetime expires_at
        datetime revoked_at
    }

    EMAIL_TOKENS {
        int id PK
        int user_id FK
        string token
        enum type "verify | reset"
        datetime expires_at
    }

    AUDIT_LOGS {
        int id PK
        int actor_id FK "user"
        int target_id
        string action
        jsonb meta
        datetime created_at
    }

    %% ───────────────────────────────────────────
    %%  Game Sessions & Gameplay
    %% ───────────────────────────────────────────
    GAME_SESSION {
        int id PK
        enum mode   "solo | comp | collab"
        enum status "active | paused | finished"
        datetime started_at
        datetime updated_at
        datetime ended_at
    }

    SESSION_PLAYERS {
        int session_id PK FK
        int user_id    PK FK
        smallint hearts_left
        int score
    }

    QUESTION {
        int id PK
        int topic_id FK
        enum difficulty "1–5"
        text content
        text explanation
        datetime created_at
    }

    ANSWER {
        int id PK
        int question_id FK
        text content
        boolean is_correct
    }

    QUESTION_MEDIA {
        int id PK
        int question_id FK
        string url
        enum media_type "png | gif | mp3"
    }

    PLAYER_ANSWER {
        int id PK
        int session_id FK
        int question_id FK
        int selected_answer_id FK
        boolean is_correct
        int points_awarded
        int answer_time_ms
        datetime answered_at
    }

    TOPIC {
        int id PK
        string title
        text description
    }

    USER_QUESTION_STAR {
        int user_id PK FK
        int question_id PK FK
        datetime starred_at
    }

    %% ───────────────────────────────────────────
    %%  Gamification
    %% ───────────────────────────────────────────
    BADGE {
        int id PK
        string title
        text description
        string icon_path
    }

    USER_BADGE {
        int id PK
        int user_id FK
        int badge_id FK
        datetime achieved_at
    }

    LEADERBOARD {
        int id PK
        enum mode   "solo | comp | collab"
        enum period "daily | weekly | monthly"
        datetime created_at
    }

    LEADERBOARD_ENTRY {
        int id PK
        int leaderboard_id FK
        int user_id FK
        int rank
        int score
    }

    %% ───────────────────────────────────────────
    %%  Relationships
    %% ───────────────────────────────────────────
    USER        ||--o{ USER_ROLES           : has
    ROLE        ||--o{ USER_ROLES           : defines
    USER        ||--o{ WALLET               : owns
    USER        ||--o{ REFRESH_TOKEN        : uses
    USER        ||--o{ EMAIL_TOKENS         : receives
    USER        ||--o{ SESSION_PLAYERS      : plays
    USER        ||--o{ USER_BADGE           : earns
    USER        ||--o{ USER_QUESTION_STAR   : stars
    USER        ||--o{ LEADERBOARD_ENTRY    : ranked
    USER        ||--o{ AUDIT_LOGS           : acts

    GAME_SESSION ||--o{ SESSION_PLAYERS     : includes
    GAME_SESSION ||--o{ PLAYER_ANSWER       : records

    SESSION_PLAYERS }o--|| USER             : player
    SESSION_PLAYERS }o--|| GAME_SESSION     : session

    QUESTION    ||--o{ ANSWER              : has
    QUESTION    ||--o{ QUESTION_MEDIA      : media
    QUESTION    ||--o{ PLAYER_ANSWER       : asked_in
    QUESTION    ||--o{ USER_QUESTION_STAR  : starred
    TOPIC       ||--o{ QUESTION            : groups

    PLAYER_ANSWER }o--|| ANSWER            : chosen
    PLAYER_ANSWER }o--|| QUESTION          : for

    BADGE       ||--o{ USER_BADGE          : awarded
    LEADERBOARD ||--o{ LEADERBOARD_ENTRY   : lists
```
