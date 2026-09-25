module.exports = {
  dependencies: {
    "@react-native-community/slider": {
      platforms: {
        ios: process.env.EXPO_TV === "1" ? null : undefined,
      },
    },
  },
};
