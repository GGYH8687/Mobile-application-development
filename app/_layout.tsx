// import { Stack } from "expo-router";

// export default function RootLayout() {
//   return <Stack />;
// }
import { Stack } from 'expo-router';
import React from 'react';

export default function Layout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
