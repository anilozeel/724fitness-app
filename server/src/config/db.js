import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const dialect = process.env.DB_DIALECT || 'sqlite';

let sequelize;

if (dialect === 'mysql') {
  // ----- Canlı (Plesk) için MySQL -----
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 3306,
      dialect: 'mysql',
      logging: false,
      define: { underscored: true },
      pool: { max: 5, min: 0, acquire: 30000, idle: 10000 },
    }
  );
} else {
  // ----- Lokal geliştirme için SQLite -----
  const storage = process.env.DB_STORAGE || path.join(__dirname, '../../data/dev.sqlite');
  const dir = path.dirname(storage);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage,
    logging: false,
    define: { underscored: true },
  });
}

export default sequelize;
