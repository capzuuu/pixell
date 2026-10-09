import { dbManager } from '../config/db';

async function runSeed() {
  console.log('🚀 Starting Pixell Database Seeder...');
  try {
    const adapter = await dbManager.getAdapter();
    await adapter.seed();
    console.log('🎉 Seed operation completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeder failed:', error);
    process.exit(1);
  }
}

runSeed();
