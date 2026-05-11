import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  StatusBar,
  Image,
} from 'react-native';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../../context/AuthContext';
import Icon from 'react-native-vector-icons/Ionicons';
import Icons from 'react-native-vector-icons/MaterialCommunityIcons';
import { DEFAULT_AVATAR } from '../../constants/images';
import { StyleSheet } from 'react-native';
import { primaryColor } from '../../constants/colors';
import EmptyComponent from '../../components/EmptyComponent/EmptyComponent';
import { Swipeable } from 'react-native-gesture-handler';
import AllNotificationsScreenSkeleton from '../AllNotificationsScreenSkeleton/AllNotificationsScreenSkeleton';
import { BACKEND_URL } from '../../services/apis';

const AllNotificationScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const { userId } = useContext(AuthContext);

  const fetchNotifications = useCallback(async () => {
    try {
      if (!userId) {
        return;
      }

      setLoading(true);

      const token = await AsyncStorage.getItem('token');

      const url = `${BACKEND_URL}/api/v1/notifications`;

      console.log('notifications url------------', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${token}`,
        },
      });

      const result = await response.json();

      console.log(
        'notifications response============',
        JSON.stringify(result, null, 2),
      );

      if (!response.ok) {
        throw new Error(result?.message || 'Failed to fetch notifications');
      }

      setNotifications(result?.data || []);
    } catch (e) {
      console.log('notifications fetch error-----------', e);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);

    await fetchNotifications();

    setRefreshing(false);
  }, [fetchNotifications]);

  const handleNotificationPress = async notification => {
    try {
      const updatedNotifications = notifications.map(item =>
        item?.notification?.id === notification?.notification?.id
          ? {
              ...item,
              notification: {
                ...item.notification,
                isRead: true,
              },
            }
          : item,
      );

      setNotifications(updatedNotifications);

      const token = await AsyncStorage.getItem('token');

      const url = `${BACKEND_URL}/api/v1/customer/notifications/${notification?.notification?.id}/read`;

      await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${token}`,
        },
      });
    } catch (e) {
      console.log('mark notification read error-----------', e);
    }
  };

  const deleteNotification = async id => {
    try {
      setNotifications(
        notifications.filter(item => item?.notification?.id !== id),
      );

      const token = await AsyncStorage.getItem('token');

      const url = `${BACKEND_URL}/api/v1/customer/notifications/${id}`;

      await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${token}`,
        },
      });
    } catch (e) {
      console.log('delete notification error------------', e);
    }
  };

  const renderRightActions = (progress, dragX, notification) => {
    return (
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteNotification(notification?.notification?.id)}
      >
        <Icons name="trash-can-outline" size={20} color="#E84F67" />
      </TouchableOpacity>
    );
  };

  const renderNotificationItem = ({ item }) => {
    const notificationType =
      item?.notificationType?.name || item?.notificationType?.type || '';

    const createdAt = item?.notification?.createdAt;

    const formattedDate = createdAt ? new Date(createdAt).toLocaleString() : '';

    return (
      <Swipeable
        renderRightActions={(progress, dragX) =>
          renderRightActions(progress, dragX, item)
        }
      >
        <TouchableOpacity
          style={[
            styles.notificationItem,
            item?.notification?.isRead && styles.readNotification,
          ]}
          onPress={() => handleNotificationPress(item)}
        >
          <Image
            source={{
              uri:
                item?.shop?.shopImage ||
                item?.fromUser?.profileImage ||
                DEFAULT_AVATAR,
            }}
            style={styles.avatar}
          />

          <View style={styles.notificationContent}>
            <Text style={styles.notificationTitle}>
              {notificationType === 'appointment_accepted'
                ? 'Appointment accepted'
                : notificationType === 'appointment_rejected'
                ? 'Appointment rejected'
                : notificationType === 'appointment_confirmed'
                ? 'Appointment confirmed'
                : 'Notification'}
            </Text>

            <Text style={styles.notificationMessage}>
              {item?.notification?.message}
            </Text>

            <Text style={styles.notificationTime}>{formattedDate}</Text>
          </View>

          {!item?.notification?.isRead && <View style={styles.unreadDot} />}
        </TouchableOpacity>
      </Swipeable>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={primaryColor} />

      <View style={styles.header}>
        <Image
          source={require('../../assets/images/home_bg-1.png')}
          style={styles.headerImage}
        />

        <View style={styles.overlay} />

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="chevron-back" size={24} color="#fff" />

          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.title}>Notifications</Text>

        {loading ? (
          <AllNotificationsScreenSkeleton />
        ) : !loading && notifications.length === 0 ? (
          <EmptyComponent />
        ) : (
          <FlatList
            data={notifications}
            renderItem={renderNotificationItem}
            keyExtractor={(item, index) =>
              String(item?.notification?.id || index)
            }
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },

  header: {
    height: 120,
    justifyContent: 'center',
    paddingTop: 20,
  },

  headerImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: primaryColor,
  },

  backButton: {
    position: 'absolute',
    top: 50,
    left: 15,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
  },

  backButtonText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 5,
  },

  contentContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
    paddingTop: 10,
  },

  listContainer: {
    padding: 16,
  },

  notificationItem: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: primaryColor,
  },

  readNotification: {
    backgroundColor: '#ffffff',
    borderLeftColor: '#ccc',
  },

  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
  },

  notificationContent: {
    flex: 1,
  },

  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },

  notificationMessage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },

  notificationTime: {
    fontSize: 12,
    color: '#999',
  },

  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
    marginLeft: 8,
  },

  deleteButton: {
    backgroundColor: 'whitesmoke',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '80%',
    borderRadius: 8,
    marginTop: 8,
  },

  title: {
    fontSize: 24,
    fontWeight: '500',
    textAlign: 'center',
    marginVertical: 10,
    color: '#333',
  },
});

export default AllNotificationScreen;
