"""note_templates

Revision ID: a7e3b9c1d2f4
Revises: 8d42f9c69f3a
Create Date: 2026-05-26

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "a7e3b9c1d2f4"
down_revision: Union[str, Sequence[str], None] = "8d42f9c69f3a"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "note_templates",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=128), nullable=False),
        sa.Column("body", sa.Text(), nullable=False),
        sa.Column("is_deleted", sa.Boolean(), nullable=False),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("delete_reason", sa.String(length=512), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "title", name="uq_note_templates_user_title"),
    )
    with op.batch_alter_table("note_templates", schema=None) as batch_op:
        batch_op.create_index(batch_op.f("ix_note_templates_user_id"), ["user_id"], unique=False)


def downgrade() -> None:
    with op.batch_alter_table("note_templates", schema=None) as batch_op:
        batch_op.drop_index(batch_op.f("ix_note_templates_user_id"))
    op.drop_table("note_templates")
