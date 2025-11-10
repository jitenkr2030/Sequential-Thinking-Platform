// Mobile app configuration for Sequential Thinking Platform
export const mobileConfig = {
  // App Information
  appInfo: {
    name: 'Sequential Thinking',
    shortName: 'SeqThink',
    description: 'Learn professional reasoning through structured thinking',
    version: '1.0.0',
    author: 'Sequential Thinking Inc.',
    website: 'https://sequential-thinking.com',
    supportEmail: 'support@sequential-thinking.com'
  },

  // Mobile App Settings
  appSettings: {
    // Theme
    theme: {
      primaryColor: '#3b82f6',
      secondaryColor: '#8b5cf6',
      accentColor: '#10b981',
      backgroundColor: '#f8fafc',
      surfaceColor: '#ffffff',
      textColor: '#1f2937',
      secondaryTextColor: '#6b7280'
    },

    // Navigation
    navigation: {
      bottomBarHeight: 64,
      headerHeight: 56,
      sidebarWidth: 256,
      borderRadius: 12,
      spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32
      }
    },

    // Touch Settings
    touch: {
      tapThreshold: 10,
      longPressDelay: 500,
      swipeThreshold: 50,
      doubleTapDelay: 300,
      scrollDecelerationRate: 0.98,
      zoomScale: 1.1
    },

    // Animation Settings
    animations: {
      duration: {
        fast: 150,
        normal: 300,
        slow: 500
      },
      easing: {
        linear: 'linear',
        easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
        easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
        easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)'
      }
    },

    // Offline Settings
    offline: {
      maxCacheSize: 100 * 1024 * 1024, // 100MB
      cacheExpiry: 7 * 24 * 60 * 60 * 1000, // 7 days
      syncInterval: 5 * 60 * 1000, // 5 minutes
      retryAttempts: 3,
      retryDelay: 1000
    },

    // Notification Settings
    notifications: {
      quietHours: {
        start: '22:00',
        end: '08:00'
      },
      maxNotifications: 50,
      soundEnabled: true,
      vibrationEnabled: true,
      ledEnabled: true
    },

    // Performance Settings
    performance: {
      imageOptimization: true,
      lazyLoading: true,
      virtualization: true,
      memoization: true,
      debounceDelay: 300,
      throttleDelay: 100
    }
  },

  // Platform Specific Settings
  platforms: {
    ios: {
      statusBarStyle: 'default',
      preferredStatusBarStyle: 'dark-content',
      bundleIdentifier: 'com.sequentialthinking.app',
      appStoreUrl: 'https://apps.apple.com/app/sequential-thinking',
      minimumVersion: '14.0',
      deviceTypes: ['iphone', 'ipad'],
      orientations: ['portrait', 'landscape'],
      launchScreen: {
        storyboard: 'LaunchScreen.storyboard',
        imageSet: 'LaunchImage.launchimage'
      }
    },

    android: {
      packageName: 'com.sequentialthinking.app',
      playStoreUrl: 'https://play.google.com/store/apps/details?id=com.sequentialthinking.app',
      minimumVersion: '21',
      targetSdkVersion: '33',
      versionCode: 1,
      permissions: [
        'android.permission.INTERNET',
        'android.permission.ACCESS_NETWORK_STATE',
        'android.permission.VIBRATE',
        'android.permission.RECEIVE_BOOT_COMPLETED',
        'android.permission.WAKE_LOCK',
        'android.permission.FOREGROUND_SERVICE'
      ],
      theme: {
        primaryColor: '#3b82f6',
        primaryDarkColor: '#1e40af',
        accentColor: '#10b981',
        windowBackground: '#ffffff',
        textColorPrimary: '#1f2937',
        textColorSecondary: '#6b7280'
      }
    },

    pwa: {
      scope: '/',
      startUrl: '/',
      display: 'standalone',
      orientation: 'portrait-primary',
      categories: ['education', 'productivity'],
      screenshots: [
        {
          src: '/screenshots/home.png',
          sizes: '1280x720',
          type: 'image/png',
          form_factor: 'wide'
        },
        {
          src: '/screenshots/mobile.png',
          sizes: '750x1334',
          type: 'image/png',
          form_factor: 'narrow'
        }
      ],
      shortcuts: [
        {
          name: 'Study',
          short_name: 'Study',
          description: 'Start learning session',
          url: '/?mode=self-study',
          icons: [{ src: '/icons/study-icon.svg', sizes: '96x96', type: 'image/svg+xml' }]
        },
        {
          name: 'Exam',
          short_name: 'Exam',
          description: 'Practice exam',
          url: '/?mode=exam-simulation',
          icons: [{ src: '/icons/exam-icon.svg', sizes: '96x96', type: 'image/svg+xml' }]
        },
        {
          name: 'Analytics',
          short_name: 'Stats',
          description: 'View progress',
          url: '/?mode=analytics',
          icons: [{ src: '/icons/analytics-icon.svg', sizes: '96x96', type: 'image/svg+xml' }]
        }
      ]
    }
  },

  // Feature Flags
  features: {
    enableOfflineMode: true,
    enablePushNotifications: true,
    enableGestureNavigation: true,
    enableHapticFeedback: true,
    enableBiometricAuth: true,
    enableDarkMode: true,
    enableMultiLanguage: true,
    enableVoiceCommands: false,
    enableARFeatures: false,
    enableMLFeatures: true
  },

  // API Endpoints
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'https://api.sequential-thinking.com',
    endpoints: {
      auth: '/auth',
      users: '/users',
      learning: '/learning',
      progress: '/progress',
      notifications: '/notifications',
      offline: '/offline',
      analytics: '/analytics'
    },
    timeout: 30000,
    retryAttempts: 3
  },

  // Analytics and Tracking
  analytics: {
    enabled: true,
    providers: ['google-analytics', 'mixpanel'],
    events: {
      appLaunch: 'app_launch',
      sessionStart: 'session_start',
      sessionEnd: 'session_end',
      pageView: 'page_view',
      buttonClick: 'button_click',
      formSubmit: 'form_submit',
      error: 'error',
      achievement: 'achievement'
    }
  },

  // Security Settings
  security: {
    encryption: {
      enabled: true,
      algorithm: 'AES-256-GCM',
      keyRotationDays: 90
    },
    authentication: {
      sessionTimeout: 3600000, // 1 hour
      maxLoginAttempts: 5,
      lockoutDuration: 900000, // 15 minutes
      requireMfa: false
    },
    data: {
      anonymizeIp: true,
      retainDataDays: 365,
      allowDataExport: true,
      allowDataDeletion: true
    }
  }
}

export default mobileConfig