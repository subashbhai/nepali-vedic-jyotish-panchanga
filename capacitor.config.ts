interface CapacitorConfig {
  appId: string;
  appName: string;
  webDir: string;
  [key: string]: any;
}

const config: CapacitorConfig = {
  appId: 'com.balananda.jyotish',
  appName: 'बालानन्द वैदिक ज्योतिष सेवा',
  webDir: 'dist'
};

export default config;
