import { readFileSync, writeFileSync, existsSync } from 'node:fs'

/**
 * Open an existing SQLite file (read-only).
 * @param {Function} getSql - Lazy sql.js initializer
 * @param {string} dbPath - Full path to .sqlite file
 * @returns {Database|null}
 */
export async function openDb(getSql, dbPath) {
  if (!existsSync(dbPath)) return null
  const SQL = await getSql()
  const buffer = readFileSync(dbPath)
  return new SQL.Database(buffer)
}

/**
 * Create a new in-memory database.
 * @param {Function} getSql
 * @returns {Database}
 */
export async function createDb(getSql) {
  const SQL = await getSql()
  return new SQL.Database()
}

/**
 * Write database to file.
 * @param {Database} db
 * @param {string} dbPath
 */
export function saveDb(db, dbPath) {
  const data = db.export()
  writeFileSync(dbPath, Buffer.from(data))
}

/**
 * SELECT → array of objects.
 * @param {Database} db
 * @param {string} sql
 * @param {Array} params
 * @returns {Array<Object>}
 */
export function queryAll(db, sql, params = []) {
  const stmt = db.prepare(sql)
  if (params.length) stmt.bind(params)
  const results = []
  while (stmt.step()) {
    results.push(stmt.getAsObject())
  }
  stmt.free()
  return results
}

/**
 * SELECT → single object or null.
 * @param {Database} db
 * @param {string} sql
 * @param {Array} params
 * @returns {Object|null}
 */
export function queryOne(db, sql, params = []) {
  const stmt = db.prepare(sql)
  if (params.length) stmt.bind(params)
  const result = stmt.step() ? stmt.getAsObject() : null
  stmt.free()
  return result
}

/**
 * Batch INSERT with transaction.
 * @param {Database} db
 * @param {string} sql - INSERT statement with ? placeholders
 * @param {Array<Array>} rows
 */
export function batchInsert(db, sql, rows) {
  db.run('BEGIN TRANSACTION')
  const stmt = db.prepare(sql)
  for (const row of rows) {
    stmt.run(row)
  }
  stmt.free()
  db.run('COMMIT')
}
