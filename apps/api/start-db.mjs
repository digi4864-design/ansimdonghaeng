import EmbeddedPostgres from 'embedded-postgres';

// Override locale to C to avoid Korean locale encoding issues with initdb
process.env.LC_ALL = 'C';
process.env.LC_COLLATE = 'C';
process.env.LC_CTYPE = 'C';
process.env.LANG = 'C';

const pg = new EmbeddedPostgres({
  databaseDir: 'C:/pgdata/ansim',
  user: 'postgres',
  password: 'postgres',
  port: 54321,
  persistent: true,
  initdbFlags: ['--locale=C', '--encoding=UTF8'],
});

console.log('Starting embedded PostgreSQL...');
await pg.initialise();
await pg.start();

// Create database
try {
  await pg.createDatabase('ansim');
  console.log('Database "ansim" created');
} catch (e) {
  console.log('Database may already exist:', e.message);
}

console.log('PostgreSQL running on port 54321');
console.log('DATABASE_URL=postgresql://postgres:postgres@localhost:54321/ansim?sslmode=disable');

// Keep running
process.on('SIGTERM', async () => {
  await pg.stop();
  process.exit(0);
});
