import Knex from 'knex';

export async function up(knex: Knex) {
  return knex.schema.createTable('users', table => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('surname').notNullable();
    table.string('email').notNullable().unique();
    table.string('password').notNullable();
    table.string ('avatar').nullable();
    table.string('whatsapp').nullable();
    table.string('bio').nullable();
    table.string('passResetToken').nullable();
    table.date('passResetExpires').nullable();
  });
}

export async function down(knex: Knex) {
  return knex.schema.dropTable('users');
}
