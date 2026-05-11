import React, { useContext, useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  FlatList,
  Image,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../../context/AuthContext';
import EmptyComponent from '../../components/EmptyComponent/EmptyComponent';
import { NO_IMAGE } from '../../constants/images';
import {
  convertFIrstCharToUpper,
  formatText,
  formatTimestamp,
} from '../../utils/utils';
import AllAppointmentsScreenSkeleton from '../AllAppointmentsScreenSkeleton/AllAppointmentsScreenSkeleton';
import { primaryColor } from '../../constants/colors';
import { useFocusEffect } from '@react-navigation/native';
import { BACKEND_URL } from '../../services/apis';

const getStatusStyles = status => {
  switch (status) {
    case 'pending':
      return {
        container: { backgroundColor: '#FAC3D7' },
        text: { color: '#111' },
      };
    case 'completed':
      return {
        container: { backgroundColor: '#E1BEE7' },
        text: { color: '#6A1B9A' },
      };
    case 'confirmed':
      return {
        container: { backgroundColor: primaryColor },
        text: { color: '#FFFFFF' },
      };
    case 'canceled':
      return {
        container: { backgroundColor: '#F1F1F1' },
        text: { color: '#9E9E9E' },
      };
    default:
      return {};
  }
};

const HistoryItem = ({ item, navigation }) => {
  const appointmentStatus =
    item?.status?.name || item?.status?.status || 'pending';

  const statusStyles = getStatusStyles(appointmentStatus?.toLowerCase?.());

  const expertImageUrl =
    typeof item?.expert?.image === 'string' &&
    item?.expert?.image?.trim() !== ''
      ? item.expert.image
      : NO_IMAGE;

  return (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => {
        navigation.navigate('AppointmentSummaryScreen', { item });
      }}
    >
      <View style={styles.expertColumn}>
        <Image source={{ uri: expertImageUrl }} style={styles.avatar} />

        <View>
          <Text style={styles.expertName}>
            {item?.expert?.name || 'Unknown Expert'}
          </Text>

          <Text style={styles.expertSpecialty}>
            {formatText(item?.expert?.specialist ?? '')}
          </Text>

          <Text style={styles.shopName}>{item?.shop?.parlourName}</Text>
        </View>
      </View>

      <View style={styles.descriptionColumn}>
        <Text style={styles.descriptionText}>
          {formatTimestamp(item?.appointment?.createdAt)}
        </Text>

        {/* <Text style={styles.descriptionText}>
          {item?.slot?.startTime || ''}
        </Text> */}

        <Text style={styles.amountText}>
          Amount : ₹{item?.appointment?.rate ?? 0}
        </Text>
      </View>

      <View style={styles.statusColumn}>
        <View style={[styles.statusBadge, statusStyles.container]}>
          <Text style={[styles.statusText, statusStyles.text]}>
            {convertFIrstCharToUpper(appointmentStatus)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const AllAppointments = ({ route, navigation }) => {
  const { userId } = useContext(AuthContext);

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAppointmentHistory = useCallback(async () => {
    try {
      if (!userId) {
        return;
      }

      setLoading(true);

      const token = await AsyncStorage.getItem('token');
      console.log('TOKEN=----------------', token);

      const url = `${BACKEND_URL}/api/v1/customer/appointments`;

      console.log('appointments url------------', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.message || 'Failed to fetch appointments');
      }

      setAppointments(result?.data || []);
    } catch (e) {
      console.log('appointment fetch error------------', e);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      fetchAppointmentHistory();
    }, [fetchAppointmentHistory]),
  );

  useEffect(() => {
    if (route.params?.newAppointment) {
      fetchAppointmentHistory();
    }
  }, [route.params?.newAppointment, fetchAppointmentHistory]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);

    await fetchAppointmentHistory();

    setRefreshing(false);
  }, [fetchAppointmentHistory]);

  if (loading && !refreshing) {
    return <AllAppointmentsScreenSkeleton />;
  }

  return (
    <View style={styles.outerContainer}>
      <StatusBar backgroundColor={primaryColor} barStyle="light-content" />

      <View style={styles.container}>
        <Text style={styles.mainTitle}>Appointment History</Text>

        {appointments.length === 0 && !loading ? (
          <FlatList
            data={[]}
            renderItem={null}
            ListEmptyComponent={
              <EmptyComponent title="No appointments Found" />
            }
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            contentContainerStyle={styles.emptyListContainer}
          />
        ) : (
          <>
            <View style={styles.headerRow}>
              <Text style={[styles.headerText, { flex: 1.5 }]}>
                Beauty Expert
              </Text>

              <Text style={[styles.headerText, { flex: 1.2 }]}>
                Description
              </Text>

              <Text
                style={[styles.headerText, { flex: 0.8, textAlign: 'right' }]}
              >
                Status
              </Text>
            </View>

            <FlatList
              data={appointments}
              renderItem={({ item }) => (
                <HistoryItem item={item} navigation={navigation} />
              )}
              keyExtractor={(item, index) =>
                String(item?.appointment?.id || index)
              }
              showsVerticalScrollIndicator={false}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
            />
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: primaryColor,
  },

  container: {
    flex: 1,
    marginTop: 80,
    backgroundColor: '#fff',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 25,
  },

  mainTitle: {
    fontSize: 26,
    fontWeight: '400',
    color: '#333',
    textAlign: 'center',
    marginVertical: 25,
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },

  headerText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111',
  },

  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
  },

  expertColumn: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    marginRight: 10,
  },

  expertName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },

  expertSpecialty: {
    fontSize: 13,
    color: '#777',
  },

  shopName: {
    fontSize: 12,
    color: primaryColor,
    marginTop: 2,
  },

  descriptionColumn: {
    flex: 1.2,
  },

  descriptionText: {
    fontSize: 12,
    color: '#555',
    lineHeight: 20,
  },

  amountText: {
    fontSize: 12,
    color: '#111',
    fontWeight: '600',
    marginTop: 2,
  },

  statusColumn: {
    flex: 0.8,
    alignItems: 'flex-end',
  },

  statusBadge: {
    borderRadius: 15,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },

  statusText: {
    fontSize: 10,
    fontWeight: '500',
  },

  separator: {
    height: 1,
    backgroundColor: '#F0F0F0',
  },

  emptyListContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AllAppointments;
