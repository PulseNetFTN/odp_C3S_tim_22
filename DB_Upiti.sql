-- PostgreSQL schema for PulseNet
-- Connect to the pulsenet database before running:
--   psql -U pulsenet -d pulsenet -f DB_Upiti.sql

-- Reusable trigger function for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

--  users 

CREATE TABLE IF NOT EXISTS users (
    id             SERIAL       PRIMARY KEY,
    username       VARCHAR(40)  UNIQUE NOT NULL,
    email          VARCHAR(255) UNIQUE NOT NULL,
    password_hash  VARCHAR(500)        NOT NULL,
    first_name     VARCHAR(50)         NOT NULL,
    last_name      VARCHAR(50)         NOT NULL,
    bio            VARCHAR(300)                    DEFAULT NULL,
    profile_image  TEXT                            DEFAULT NULL,
    role           VARCHAR(10)  NOT NULL           DEFAULT 'user',
    created_at     TIMESTAMPTZ  NOT NULL           DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_role     CHECK (role IN ('user', 'admin')),
    CONSTRAINT chk_username CHECK (
        CHAR_LENGTH(username) >= 3 AND
        username ~ '^[a-zA-Z0-9-]+$'
    ),
    CONSTRAINT chk_email CHECK (CHAR_LENGTH(email) >= 5),
    CONSTRAINT chk_bio   CHECK (bio IS NULL OR CHAR_LENGTH(bio) <= 300)
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role  ON users(role);

--  communities 

CREATE TABLE IF NOT EXISTS communities (
    id          SERIAL      PRIMARY KEY,
    name        VARCHAR(80) UNIQUE NOT NULL,
    description VARCHAR(500)           DEFAULT NULL,
    rules       TEXT                   DEFAULT NULL,
    avatar      TEXT                   DEFAULT NULL,
    type        VARCHAR(10) NOT NULL   DEFAULT 'public',
    creator_id  INTEGER     NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL   DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_community_type CHECK (type IN ('public', 'private')),
    CONSTRAINT chk_community_name CHECK (CHAR_LENGTH(name) >= 2),
    CONSTRAINT fk_community_creator FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_communities_type    ON communities(type);
CREATE INDEX IF NOT EXISTS idx_communities_creator ON communities(creator_id);

--  tags 

CREATE TABLE IF NOT EXISTS tags (
    id   SERIAL      PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

--  posts 

CREATE TABLE IF NOT EXISTS posts (
    id           SERIAL      PRIMARY KEY,
    title        VARCHAR(200) NOT NULL,
    content      TEXT         NOT NULL,
    media_url    TEXT                    DEFAULT NULL,
    community_id INTEGER      NOT NULL,
    author_id    INTEGER      NOT NULL,
    created_at   TIMESTAMPTZ  NOT NULL   DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMPTZ  NOT NULL   DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_post_community FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE CASCADE,
    CONSTRAINT fk_post_author    FOREIGN KEY (author_id)    REFERENCES users(id)        ON DELETE CASCADE,
    CONSTRAINT chk_title   CHECK (CHAR_LENGTH(title)   >= 5  AND CHAR_LENGTH(title)   <= 200),
    CONSTRAINT chk_content CHECK (CHAR_LENGTH(content) >= 10 AND CHAR_LENGTH(content) <= 10000)
);

CREATE INDEX IF NOT EXISTS idx_posts_community ON posts(community_id);
CREATE INDEX IF NOT EXISTS idx_posts_author    ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_created   ON posts(created_at DESC);

CREATE TRIGGER trg_posts_updated_at
    BEFORE UPDATE ON posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

--  comments 

CREATE TABLE IF NOT EXISTS comments (
    id         SERIAL       PRIMARY KEY,
    content    VARCHAR(2000) NOT NULL,
    post_id    INTEGER       NOT NULL,
    author_id  INTEGER       NOT NULL,
    parent_id  INTEGER                  DEFAULT NULL,
    is_deleted BOOLEAN       NOT NULL   DEFAULT FALSE,
    is_flagged BOOLEAN       NOT NULL   DEFAULT FALSE,
    created_at TIMESTAMPTZ   NOT NULL   DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ   NOT NULL   DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_comment_post   FOREIGN KEY (post_id)   REFERENCES posts(id)    ON DELETE CASCADE,
    CONSTRAINT fk_comment_author FOREIGN KEY (author_id) REFERENCES users(id)    ON DELETE CASCADE,
    CONSTRAINT fk_comment_parent FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE,
    CONSTRAINT chk_comment_content CHECK (CHAR_LENGTH(content) >= 1 AND CHAR_LENGTH(content) <= 2000)
);

CREATE INDEX IF NOT EXISTS idx_comments_post   ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_author ON comments(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parent_id);

CREATE TRIGGER trg_comments_updated_at
    BEFORE UPDATE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

--  refresh_tokens 

CREATE TABLE IF NOT EXISTS refresh_tokens (
    id         SERIAL       PRIMARY KEY,
    user_id    INTEGER      NOT NULL,
    token_hash VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ  NOT NULL,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_rt_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_hash ON refresh_tokens(token_hash);

--  audits 

CREATE TABLE IF NOT EXISTS audits (
    id          SERIAL       PRIMARY KEY,
    user_id     INTEGER              DEFAULT NULL,
    action      VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50)  NOT NULL,
    entity_id   INTEGER              DEFAULT NULL,
    details     TEXT                 DEFAULT NULL,
    ip_address  VARCHAR(45)          DEFAULT NULL,
    user_agent  TEXT                 DEFAULT NULL,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_audits_user    ON audits(user_id);
CREATE INDEX IF NOT EXISTS idx_audits_created ON audits(created_at DESC);

--  community_members 

CREATE TABLE IF NOT EXISTS community_members (
    user_id      INTEGER     NOT NULL,
    community_id INTEGER     NOT NULL,
    role         VARCHAR(10) NOT NULL DEFAULT 'member',
    status       VARCHAR(10) NOT NULL DEFAULT 'active',
    joined_at    TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, community_id),
    CONSTRAINT chk_cm_role   CHECK (role   IN ('moderator', 'member')),
    CONSTRAINT chk_cm_status CHECK (status IN ('active', 'pending', 'banned')),
    CONSTRAINT fk_cm_user      FOREIGN KEY (user_id)      REFERENCES users(id)       ON DELETE CASCADE,
    CONSTRAINT fk_cm_community FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE CASCADE
);

--  post_tags 

CREATE TABLE IF NOT EXISTS post_tags (
    post_id INTEGER NOT NULL,
    tag_id  INTEGER NOT NULL,
    PRIMARY KEY (post_id, tag_id),
    CONSTRAINT fk_pt_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    CONSTRAINT fk_pt_tag  FOREIGN KEY (tag_id)  REFERENCES tags(id)  ON DELETE CASCADE
);

--  post_likes 

CREATE TABLE IF NOT EXISTS post_likes (
    user_id  INTEGER     NOT NULL,
    post_id  INTEGER     NOT NULL,
    liked_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, post_id),
    CONSTRAINT fk_pl_user FOREIGN KEY (user_id) REFERENCES users(id)  ON DELETE CASCADE,
    CONSTRAINT fk_pl_post FOREIGN KEY (post_id) REFERENCES posts(id)  ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_post_likes_post ON post_likes(post_id);

--  comment_likes 

CREATE TABLE IF NOT EXISTS comment_likes (
    user_id    INTEGER     NOT NULL,
    comment_id INTEGER     NOT NULL,
    liked_at   TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, comment_id),
    CONSTRAINT fk_cl_user    FOREIGN KEY (user_id)    REFERENCES users(id)     ON DELETE CASCADE,
    CONSTRAINT fk_cl_comment FOREIGN KEY (comment_id) REFERENCES comments(id)  ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_comment_likes_comment ON comment_likes(comment_id);

--  user_follows 

CREATE TABLE IF NOT EXISTS user_follows (
    follower_id  INTEGER     NOT NULL,
    following_id INTEGER     NOT NULL,
    followed_at  TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (follower_id, following_id),
    CONSTRAINT fk_uf_follower  FOREIGN KEY (follower_id)  REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_uf_following FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_no_self_follow CHECK (follower_id != following_id)
);

CREATE INDEX IF NOT EXISTS idx_user_follows_following ON user_follows(following_id);
