# Alembic Migration Versions

This directory contains the database migration scripts for the project, managed by Alembic. Each file represents a sequential change to the database schema.

## Migration Workflow

### 1. Create a New Migration

After making changes to the SQLModel definitions in `app/models/`, generate a new revision script. Use a short, descriptive message in `snake_case`.

```bash
# From the project root
cd backend
alembic revision --autogenerate -m "a_short_description_of_changes"
```

This will create a new file in this directory.

### 2. Review and Edit the Migration

**This is a critical step.** Alembic's autogeneration is a helpful starting point, but it often requires manual adjustments.

- **Verify the generated operations** (e.g., `op.add_column`, `op.create_table`).
- **Adjust as needed.** Complex changes like data migrations, ENUM type alterations, or custom index creations often require manual editing.
- **Ensure the `upgrade()` and `downgrade()` functions are symmetrical.** Downgrading should perfectly revert the changes made by upgrading.

## Naming and Revision Guidelines

To maintain a clean and linear migration history, please follow these rules immediately after generation:

1.  **Sequential Naming**: The auto-generated file will have a random hash. **Rename it** to follow a sequential numeric prefix (e.g., `006_your_description.py`). Find the last number in this directory and increment it.
2.  **Update Revision ID**: Open the new file and change the `revision` variable to match the file's new prefix (e.g., `revision: str = "006_your_description"`).
3.  **Check the Revision Chain**: Ensure the `down_revision` variable correctly points to the `revision` ID of the *previous* migration file. Alembic should set this correctly, but it is essential to verify.
4.  **Keep Docstrings Clean**: For clarity, update the `Revises:` field in the top-level docstring to match the `down_revision` ID.

## Applying and Reverting Migrations

### Apply Migrations

To run all pending migrations and apply changes to the database:

```bash
# From the project root
cd backend
alembic upgrade head
```

### Revert Migrations

To undo a migration, you can downgrade to a specific revision or step back by one.

```bash
# Revert to a specific version
alembic downgrade <revision_id>

# Revert the last applied migration
alembic downgrade -1
```

**Caution**: Only downgrade migrations that have not been pushed to a shared branch or deployed. Reverting migrations on a shared database can lead to serious issues for other developers.
