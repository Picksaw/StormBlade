import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.picksaw.stormblade',
  appName: 'STORMBLADE',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true
  },
  android: {
    backgroundColor: '#05060f',
    allowMixedContent: true
  }
};

export default config;
