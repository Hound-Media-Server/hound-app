# Hound App

![App Screenshot](./assets/screenshots/home.png)

## About

This is the repo for Hound Media Server's Android, AndroidTV, iOS and tvOS apps.
For the server and web app repo, go [here](https://github.com/houndmediaserver/hound).

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

This project uses

- the [React Native TV fork](https://github.com/react-native-tvos/react-native-tvos), which supports both phone (Android and iOS) and TV (Android TV and Apple TV) targets
- the [React Native TV config plugin](https://github.com/react-native-tvos/config-tv/tree/main/packages/config-tv) to allow Expo prebuild to modify the project's native files for TV builds

## Installing

You can install Android mobile and Android TV apps by sideloading the .apk in the Releases page. iOS and tvOS are not available yet outside of the development environment, as publishing for iOS requires more time.

## How to use

- `cd` into the project

- For TV development:

```sh
yarn
yarn prebuild:tv # Executes clean Expo prebuild with TV modifications
yarn ios # Build and run for Apple TV
yarn android # Build for Android TV
yarn web # Run the project on web from localhost
```

- For mobile development:

```sh
yarn
yarn prebuild # Executes Expo prebuild with no TV modifications
yarn ios # Build and run for iOS
yarn android # Build for Android mobile
yarn web # Run the project on web from localhost
```

> **_NOTE:_**
> Setting the environment variable `EXPO_TV=1` enables the `@react-native-tvos/config-tv` plugin to modify the project for TV.
> This can also be done by setting the parameter `isTV` to true in the `app.json`.
