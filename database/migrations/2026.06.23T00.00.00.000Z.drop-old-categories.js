'use strict';

/**
 * One-off migration to remove the legacy generic `categories` table and its
 * orphaned relation link tables. The old Portfolio/Case Study relations used to
 * target `api::category.category`; after retargeting them to
 * `api::portfolio-category.portfolio-category`, Strapi tries to DROP the
 * `categories` table during schema sync but Postgres refuses because the old
 * link tables still hold foreign keys to it. We drop them first with CASCADE.
 *
 * Migrations run on startup BEFORE the automatic schema synchronization, so by
 * the time Strapi syncs there is nothing left to drop. Safe to keep in the repo;
 * every statement is IF EXISTS so it is a no-op once applied / on fresh DBs.
 */

module.exports = {
  async up(knex) {
    // Old relation link tables (v5 `_lnk` and v4 `_links` naming, just in case).
    await knex.raw('DROP TABLE IF EXISTS "portfolio_items_categories_lnk" CASCADE');
    await knex.raw('DROP TABLE IF EXISTS "case_study_items_categories_lnk" CASCADE');
    await knex.raw('DROP TABLE IF EXISTS "portfolio_items_categories_links" CASCADE');
    await knex.raw('DROP TABLE IF EXISTS "case_study_items_categories_links" CASCADE');

    // The legacy table itself; CASCADE clears any remaining dependent FKs.
    await knex.raw('DROP TABLE IF EXISTS "categories" CASCADE');
  },

  async down() {
    // No-op: this is a destructive one-way cleanup of a removed content type.
  },
};
