"""empty message

Revision ID: bdc610b2910d
Revises: 3cb86b506c03
Create Date: 2021-01-29 12:13:09.974638

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'bdc610b2910d'
down_revision = '3cb86b506c03'
branch_labels = None
depends_on = None


def upgrade(engine_name):
    globals()["upgrade_%s" % engine_name]()


def downgrade(engine_name):
    globals()["downgrade_%s" % engine_name]()





def upgrade_():
    # ### commands auto generated by Alembic - please adjust! ###
    pass
    # ### end Alembic commands ###


def downgrade_():
    # ### commands auto generated by Alembic - please adjust! ###
    pass
    # ### end Alembic commands ###


def upgrade_trackusage():
    # ### commands auto generated by Alembic - please adjust! ###
    pass
    # ### end Alembic commands ###


def downgrade_trackusage():
    # ### commands auto generated by Alembic - please adjust! ###
    pass
    # ### end Alembic commands ###


def upgrade_users():
    # ### commands auto generated by Alembic - please adjust! ###
    pass
    # ### end Alembic commands ###


def downgrade_users():
    # ### commands auto generated by Alembic - please adjust! ###
    pass
    # ### end Alembic commands ###


def upgrade_errors():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('error_groups',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(length=10), nullable=True),
    sa.PrimaryKeyConstraint('id', name=op.f('pk_error_groups')),
    sa.UniqueConstraint('name')
    )
    op.create_table('languages',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(length=30), nullable=True),
    sa.Column('code', sa.String(length=5), nullable=True),
    sa.PrimaryKeyConstraint('id', name=op.f('pk_languages')),
    sa.UniqueConstraint('code'),
    sa.UniqueConstraint('name')
    )
    op.create_table('error_codes',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('code', sa.Integer(), nullable=True),
    sa.Column('description', sa.String(length=100), nullable=True),
    sa.Column('group_id', sa.Integer(), nullable=True),
    sa.ForeignKeyConstraint(['group_id'], ['error_groups.id'], name=op.f('fk_error_codes_group_id_error_groups')),
    sa.PrimaryKeyConstraint('id', name=op.f('pk_error_codes')),
    sa.UniqueConstraint('code')
    )
    op.create_table('error_translations',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('code_id', sa.Integer(), nullable=True),
    sa.Column('language_id', sa.Integer(), nullable=True),
    sa.Column('message', sa.String(length=200), nullable=True),
    sa.ForeignKeyConstraint(['code_id'], ['error_codes.id'], name=op.f('fk_error_translations_code_id_error_codes')),
    sa.ForeignKeyConstraint(['language_id'], ['languages.id'], name=op.f('fk_error_translations_language_id_languages')),
    sa.PrimaryKeyConstraint('id', name=op.f('pk_error_translations'))
    )
    # ### end Alembic commands ###


def downgrade_errors():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('error_translations')
    op.drop_table('error_codes')
    op.drop_table('languages')
    op.drop_table('error_groups')
    # ### end Alembic commands ###


def upgrade_ideas():
    # ### commands auto generated by Alembic - please adjust! ###
    pass
    # ### end Alembic commands ###


def downgrade_ideas():
    # ### commands auto generated by Alembic - please adjust! ###
    pass
    # ### end Alembic commands ###


def upgrade_feed_err():
    # ### commands auto generated by Alembic - please adjust! ###
    pass
    # ### end Alembic commands ###


def downgrade_feed_err():
    # ### commands auto generated by Alembic - please adjust! ###
    pass
    # ### end Alembic commands ###

