interface CapacitorConfig {
  appId: string;
  appName: string;
  webDir: string;
  [key: string]: any;
}

const config: CapacitorConfig = {
  appId: 'com.balananda.jyotish',
  appName: 'नेपाली वैदिक ज्योतिष',
  webDir: 'dist'
};

export default config;
