from fastapi.testclient import TestClient
from sqlmodel import Session, select

from app.db.models import Role, User, UserRole
from app.db.session import engine


def register(client: TestClient, email: str, password: str, nickname: str):
    response = client.post(
        "/auth/register",
        json={"email": email, "password": password, "nickname": nickname},
    )
    assert response.status_code == 201
    return response.json()


def login(client: TestClient, email: str, password: str):
    response = client.post("/auth/login", json={"email": email, "password": password})
    assert response.status_code == 200
    return response.json()


def promote_to_admin(email: str) -> None:
    with Session(engine) as db:
        user = db.exec(select(User).where(User.email == email)).first()
        role = db.exec(select(Role).where(Role.name == "admin")).first()
        if not role:
            role = Role(name="admin")
            db.add(role)
            db.commit()
            db.refresh(role)
        db.add(UserRole(user_id=user.id, role_id=role.id))
        db.commit()


def get_user_id(email: str) -> int:
    with Session(engine) as db:
        return db.exec(select(User.id).where(User.email == email)).first()[0]


def test_register_login_refresh_logout(client: TestClient) -> None:
    register(client, "alice@example.com", "secret", "Alice")
    tokens = login(client, "alice@example.com", "secret")

    headers = {"Authorization": f"Bearer {tokens['access_token']}"}
    me = client.get("/users/me", headers=headers)
    assert me.status_code == 200
    assert me.json()["email"] == "alice@example.com"

    ref = client.post("/auth/refresh", json={"refresh_token": tokens["refresh_token"]})
    assert ref.status_code == 200
    new_tokens = ref.json()

    logout = client.post(
        "/auth/logout", json={"refresh_token": new_tokens["refresh_token"]}
    )
    assert logout.status_code == 204

    invalid = client.post(
        "/auth/refresh", json={"refresh_token": new_tokens["refresh_token"]}
    )
    assert invalid.status_code == 401


def test_update_and_delete_me(client: TestClient) -> None:
    register(client, "bob@example.com", "secret", "Bob")
    tokens = login(client, "bob@example.com", "secret")
    headers = {"Authorization": f"Bearer {tokens['access_token']}"}

    update = client.patch("/users/me", json={"nickname": "Bobby"}, headers=headers)
    assert update.status_code == 200
    assert update.json()["nickname"] == "Bobby"

    delete = client.delete("/users/me", headers=headers)
    assert delete.status_code == 204

    me = client.get("/users/me", headers=headers)
    assert me.status_code == 401


def test_admin_can_manage_users(client: TestClient) -> None:
    register(client, "admin@example.com", "secret", "Admin")
    promote_to_admin("admin@example.com")
    admin_tokens = login(client, "admin@example.com", "secret")
    admin_headers = {"Authorization": f"Bearer {admin_tokens['access_token']}"}

    register(client, "player@example.com", "secret", "Player")
    player_id = get_user_id("player@example.com")

    response = client.get("/admin/users", headers=admin_headers)
    assert response.status_code == 200
    assert len(response.json()) == 2

    resp = client.patch(
        f"/admin/users/{player_id}/roles",
        json={"roles": ["admin"]},
        headers=admin_headers,
    )
    assert resp.status_code == 204
