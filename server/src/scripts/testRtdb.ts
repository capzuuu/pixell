import { initFirebaseAdmin, getFirebaseRtdb } from '../config/firebase';

async function testRtdb() {
  console.log('📡 Testing Firebase Realtime Database connection...');
  initFirebaseAdmin();
  const rtdb = getFirebaseRtdb();

  if (!rtdb) {
    console.error('❌ Could not connect to Firebase Realtime Database!');
    process.exit(1);
  }

  try {
    const testRef = rtdb.ref('live_streams/test_admin');
    console.log('Writing test telemetry to /live_streams/test_admin...');
    await testRef.set({
      id: 'test_admin',
      userId: 'test_admin',
      userName: 'Pixell Radar Test',
      userEmail: 'admin@pixell.tv',
      itemTitle: 'Interstellar',
      mediaType: 'movie',
      tmdbId: '157336',
      progressSeconds: 3600,
      durationSeconds: 10140,
      progressPercentage: 35,
      isLive: true,
      updatedAt: new Date().toISOString()
    });

    console.log('✅ Telemetry written successfully to Realtime Database!');

    const snap = await rtdb.ref('live_streams/test_admin').once('value');
    console.log('📖 Readback from Realtime Database:', snap.val()?.itemTitle);

    // Clean up test key
    await testRef.remove();
    console.log('🧹 Cleaned up test key.');
    console.log('🎉 Firebase Realtime Database is 100% verified and operational!');
    process.exit(0);
  } catch (error) {
    console.error('❌ RTDB test failed:', error);
    process.exit(1);
  }
}

testRtdb();
