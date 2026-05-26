/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './src/App';
import { name as appName } from './app.json';
import React from 'react';
import { AuthProvider } from './src/context/AuthContext'; // import your provider
import firestore from '@react-native-firebase/firestore';
import * as Clarity from '@microsoft/react-native-clarity';

const Root = () => (
  <AuthProvider>
    <App />
  </AuthProvider>
);

// firestore().settings({ persistence: true });

// clarity
Clarity.initialize('wt241k3lus', {
  logLevel: Clarity.LogLevel.None, // Note: Use "LogLevel.Verbose" value while testing to debug initialization issues.
});

AppRegistry.registerComponent(appName, () => Root);
