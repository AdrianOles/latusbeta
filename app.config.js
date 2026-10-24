const IS_ANDROID = process.env.APP_VARIANT === 'android';

module.exports = {
  expo: {
    name: IS_ANDROID ? "Project Latus" : "Latus",
    slug: IS_ANDROID ? "project-latus" : "Latus",
    scheme: IS_ANDROID ? "projectlatus.app" : "latus.app",
    version: "1.5.7",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    splash: {
      image: "./assets/images/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    ios: {
      buildNumber: "11",
      supportsTablet: false,
      bundleIdentifier: "latus.app",
      splash: {
        image: "./assets/images/splash.png",
        resizeMode: "contain",
        backgroundColor: "#ffffff",
        dark: {
          image: "./assets/images/splashDark.png",
          resizeMode: "contain",
          backgroundColor: "#000000"
        }
      },
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        NSPhotoLibraryUsageDescription: "This app needs access to your photos to save and share images.",
        NSPhotoLibraryAddUsageDescription: "This app needs to save images to your photos.",
        NSContactsUsageDescription: "This lets you easily find and share content with your contacts directly from the app.",
        FacebookAppID: "1433567004455755",
        FacebookDisplayName: "latus",
        LSApplicationQueriesSchemes: [
          "instagram",
          "instagram-stories",
          "fb",
          "latus.app",
          "twitter",
          "tiktoksharesdk"
        ],
        CFBundleURLTypes: [
          {
            CFBundleURLSchemes: [
              "fb1433567004455755",
              "latus.app"
            ]
          }
        ]
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        monochromeImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      edgeToEdgeEnabled: true,
      package: "app.projectlatus"
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    plugins: [
      "expo-router",
      "expo-font",
      [
        "expo-splash-screen",
        {
          "backgroundColor": "#ffffff",
          "image": "./assets/images/splash.png",
          "dark": {
            "image": "./assets/images/splashDark.png",
            "backgroundColor": "#000000"
          },
          "imageWidth": 200
        }
      ],
      [
        "expo-notifications",
        {
          "icon": "./assets/icon.png",
          "color": "#ffffff",
          "defaultChannel": "default",
          "enableBackgroundRemoteNotifications": false
        }
      ],
      [
        "expo-build-properties",
        {
          "ios": {
            "deploymentTarget": "15.1",
            "useFrameworks": "static"
          }
        }
      ],
      [
        "react-native-share",
        {
          "ios": [
            "fb",
            "instagram",
            "twitter",
            "tiktoksharesdk"
          ],
          "android": [
            "com.facebook.katana",
            "com.instagram.android",
            "com.twitter.android",
            "com.zhiliaoapp.musically"
          ]
        }
      ]
    ],
    extra: {
      router: {},
      eas: {
        projectId: IS_ANDROID
          ? "bb7b911e-b493-490e-9290-91ecaf21f30c"
          : "38ef905d-694c-488a-8e18-c0cf3bd3fd8e"
      },
      updates: {
        url: IS_ANDROID
          ? "https://u.expo.dev/bb7b911e-b493-490e-9290-91ecaf21f30c"
          : "https://u.expo.dev/38ef905d-694c-488a-8e18-c0cf3bd3fd8e"
      }
    },
    runtimeVersion: "1.5.7",
    updates: {
      url: IS_ANDROID
        ? "https://u.expo.dev/bb7b911e-b493-490e-9290-91ecaf21f30c"
        : "https://u.expo.dev/38ef905d-694c-488a-8e18-c0cf3bd3fd8e"
    }
  }
};