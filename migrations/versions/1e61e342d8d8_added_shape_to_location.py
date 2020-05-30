"""Added shape to location

Revision ID: 1e61e342d8d8
Revises: a69c79b00395
Create Date: 2020-05-30 16:12:42.238255

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '1e61e342d8d8'
down_revision = 'a69c79b00395'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('location', schema=None) as batch_op:
        batch_op.add_column(sa.Column('shape', sa.PickleType(), nullable=False))

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('location', schema=None) as batch_op:
        batch_op.drop_column('shape')

    # ### end Alembic commands ###
