"""Database seeding script for development and testing."""

from datetime import datetime, timezone

from sqlmodel import Session, select

from app.core.security import get_password_hash
from app.db.models import Role, User, UserRoles
from app.db.session import engine


def create_roles(session: Session) -> None:
    """Create basic roles if they don't exist."""
    # Check if roles already exist
    admin_role = session.exec(select(Role).where(Role.name == "admin")).first()
    if not admin_role:
        admin_role = Role(
            name="admin", description="Administrator role with full system access"
        )
        session.add(admin_role)

    user_role = session.exec(select(Role).where(Role.name == "user")).first()
    if not user_role:
        user_role = Role(
            name="user", description="Standard user role with basic access"
        )
        session.add(user_role)

    session.commit()


def create_test_users(session: Session) -> None:
    """Create test users for development."""
    # Get roles
    admin_role = session.exec(select(Role).where(Role.name == "admin")).first()
    user_role = session.exec(select(Role).where(Role.name == "user")).first()

    if not admin_role or not user_role:
        raise ValueError("Roles must be created before users")

    # Create admin user
    admin_email = "admin@quizdom.de"
    existing_admin = session.exec(select(User).where(User.email == admin_email)).first()
    if not existing_admin:
        admin_user = User(
            email=admin_email,
            password_hash=get_password_hash("admin123"),
            nickname="Admin",
            is_verified=True,
            created_at=datetime.now(timezone.utc),
        )
        session.add(admin_user)
        session.commit()
        session.refresh(admin_user)

        # Assign admin role
        if admin_user.id and admin_role.id:
            admin_user_role = UserRoles(
                user_id=admin_user.id,
                role_id=admin_role.id,
                granted_at=datetime.now(timezone.utc),
            )
            session.add(admin_user_role)
            session.commit()

        print(f"✅ Created admin user: {admin_email} / admin123")

    # Create first normal user
    user_email = "user1@quizdom.de"
    existing_user = session.exec(select(User).where(User.email == user_email)).first()
    if not existing_user:
        normal_user = User(
            email=user_email,
            password_hash=get_password_hash("user123"),
            nickname="user1",
            is_verified=True,
            created_at=datetime.now(timezone.utc),
        )
        session.add(normal_user)
        session.commit()
        session.refresh(normal_user)

        # Assign user role
        if normal_user.id and user_role.id:
            normal_user_role = UserRoles(
                user_id=normal_user.id,
                role_id=user_role.id,
                granted_at=datetime.now(timezone.utc),
            )
            session.add(normal_user_role)
            session.commit()

        print(f"✅ Created normal user: {user_email} / user123")

    # Create normal user
    user_email = "user2@quizdom.de"
    existing_user = session.exec(select(User).where(User.email == user_email)).first()
    if not existing_user:
        normal_user = User(
            email=user_email,
            password_hash=get_password_hash("user123"),
            nickname="user2",
            is_verified=True,
            created_at=datetime.now(timezone.utc),
        )
        session.add(normal_user)
        session.commit()
        session.refresh(normal_user)

        # Assign user role
        if normal_user.id and user_role.id:
            normal_user_role = UserRoles(
                user_id=normal_user.id,
                role_id=user_role.id,
                granted_at=datetime.now(timezone.utc),
            )
            session.add(normal_user_role)
            session.commit()

        print(f"✅ Created normal user: {user_email} / user123")


def seed_database() -> None:
    """Seed the database with initial data."""
    print("🌱 Starting database seeding...")

    with Session(engine) as session:
        try:
            create_roles(session)
            print("✅ Roles created successfully")

            create_test_users(session)
            print("✅ Test users created successfully")

            print("🎉 Database seeding completed successfully!")
            print("\n📋 Test User Credentials:")
            print("├── Admin User:")
            print("│   ├── Email: admin@quizdom.de")
            print("│   └── Password: admin123")
            print("├── Normal User 1:")
            print("│   ├── Email: user1@quizdom.de")
            print("│   └── Password: user123")
            print("├── Normal User 2:")
            print("│   ├── Email: user2@quizdom.de")
            print("│   └── Password: user123")

        except Exception as e:
            print(f"❌ Error during seeding: {e}")
            session.rollback()
            raise


if __name__ == "__main__":
    seed_database()
