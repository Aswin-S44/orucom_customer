import { Platform, PermissionsAndroid, Alert } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import { auth, firestore } from '../config/firebase';

class FirebaseNotificationService {
  // Request notification permissions
  static async requestNotificationPermission() {
    try {
      if (Platform.OS === 'android') {
        // For Android 13+ (API level 33+)
        if (Platform.Version >= 33) {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
            {
              title: 'Notification Permission',
              message:
                'This app needs notification permissions to send you updates',
              buttonPositive: 'OK',
            },
          );
          return granted === PermissionsAndroid.RESULTS.GRANTED;
        }
        // For older Android versions, permission is granted by default
        return true;
      } else {
        // iOS
        const authStatus = await messaging().requestPermission();
        return (
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL
        );
      }
    } catch (error) {
      console.error('Permission request error:', error);
      return false;
    }
  }

  // Get FCM token
  static async getFCMToken() {
    try {
      if (Platform.OS === 'ios') {
        await messaging().registerDeviceForRemoteMessages();
      }

      const token = await messaging().getToken();
      console.log('FCM Token:', token);

      // Store token in Firestore for the current user
      await this.storeFCMToken(token);

      return token;
    } catch (error) {
      console.error('Error getting FCM token:', error);
      return null;
    }
  }

  // Store FCM token in Firestore
  static async storeFCMToken(token) {
    try {
      const currentUser = auth().currentUser;
      if (currentUser) {
        await firestore().collection('shop-owners').doc(currentUser.uid).set(
          {
            fcmToken: token,
            updatedAt: firestore.FieldValue.serverTimestamp(),
          },
          { merge: true },
        );
      }
    } catch (error) {
      console.error('Error storing FCM token:', error);
    }
  }

  // Setup notification handlers
  static setupNotificationHandlers() {
    // Foreground messages
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      Alert.alert(
        remoteMessage.notification?.title || 'Notification',
        remoteMessage.notification?.body || 'New message received',
        [
          {
            text: 'OK',
            onPress: () => console.log('Notification pressed'),
          },
        ],
      );
    });

    // Notification opened from background/quit state
    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('Notification opened from background:', remoteMessage);
      // Handle navigation based on notification data
    });

    // Check if app was opened by notification
    messaging()
    .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log('App opened by notification:', remoteMessage);
        }
      });

    return unsubscribe;
  }

  // Subscribe to topics (for shop notifications)
  static async subscribeToShopTopic(shopId) {
    try {
      await messaging().subscribeToTopic(`shop_${shopId}`);
      console.log(`Subscribed to shop topic: shop_${shopId}`);
    } catch (error) {
      console.error('Error subscribing to topic:', error);
    }
  }

  // Unsubscribe from topics
  static async unsubscribeFromShopTopic(shopId) {
    try {
      await messaging().unsubscribeFromTopic(`shop_${shopId}`);
      console.log(`Unsubscribed from shop topic: shop_${shopId}`);
    } catch (error) {
      console.error('Error unsubscribing from topic:', error);
    }
  }
}

export default FirebaseNotificationService;
