const { sequelize } = require('../src/config/database');
const { QueryTypes } = require('sequelize');

async function migrate() {
    try {
        console.log('Starting migration to add showInHome column...');

        // Add the column if it doesn't exist
        await sequelize.query(`
            ALTER TABLE "Sponsors" 
            ADD COLUMN IF NOT EXISTS "showInHome" BOOLEAN DEFAULT true;
        `);

        console.log('✅ Migration successful: showInHome column added to Sponsors table.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

migrate();
