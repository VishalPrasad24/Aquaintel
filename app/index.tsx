
import React from 'react';
import { WebView } from 'react-native-webview';
import { StyleSheet, View, SafeAreaView, StatusBar } from 'react-native';

// !!! IMPORTANT !!!
// Replace this URL with the public URL of your deployed web application from Part 1.
const WEB_APP_URL = 'https://sih-2025-sooty.vercel.app/';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.webviewContainer}>
        <WebView
          source={{ uri: WEB_APP_URL }}
          style={styles.webview}
          // Allows the web app to request geolocation permission
          geolocationEnabled={true}
          // For handling file uploads (like the profile picture)
          onFileDownload={({ nativeEvent: { downloadUrl } }) => {
            // This is a basic handler. You might need a more robust solution
            // using libraries like expo-file-system for a production app.
            console.log('File download requested:', downloadUrl);
            return true;
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff', // A default background color
  },
  webviewContainer: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
});
