import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  FlatList,
  Image,
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { getAppointmentsByCustomerId } from '../../apis/services';
import EmptyComponent from '../../components/EmptyComponent/EmptyComponent';
import { NO_IMAGE } from '../../constants/images';
import {
  convertFIrstCharToUpper,
  formatText,
  formatTimestamp,
} from '../../utils/utils';
import AppointmentHistorySkeleton from '../../components/AppointmentHistorySkeleton/AppointmentHistorySkeleton';
import { primaryColor } from '../../constants/colors';
import ServiceCardSkeleton from '../../components/ServiceCardSkeleton/ServiceCardSkeleton';
import Loader from '../../components/Loader/Loader';

const getStatusStyles = status => {
  switch (status) {
    case 'pending':
      return {
        container: { backgroundColor: '#F3E5F5' },
        text: { color: '#8E44AD' },
      };
    case 'completed':
      return {
        container: { backgroundColor: '#E1BEE7' },
        text: { color: '#6A1B9A' },
      };
    case 'confirmed':
      return {
        container: { backgroundColor: '#9C27B0' },
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

const HistoryItem = ({ item }) => {
  const statusStyles = getStatusStyles(item.appointmentStatus);

  return (
    <View style={styles.itemContainer}>
      <View style={styles.expertColumn}>
        <Image
          source={{
            uri:
              typeof item.expert.imageUrl === 'string'
                ? item.expert.imageUrl
                : NO_IMAGE,
          }}
          style={styles.avatar}
        />
        <View>
          <Text style={styles.expertName}>{item.expert.expertName}</Text>
          <Text style={styles.expertSpecialty}>
            {formatText(item.expert.specialist ?? '')}
          </Text>
        </View>
      </View>
      <View style={styles.descriptionColumn}>
        <Text style={styles.descriptionText}>
          {formatTimestamp(item.createdAt)}
        </Text>
        <Text style={styles.descriptionText}>{item.selectedTime}</Text>
        <Text>Amount : {item.totalAmount}</Text>
      </View>
      <View style={styles.statusColumn}>
        <View style={[styles.statusBadge, statusStyles.container]}>
          <Text style={[styles.statusText, statusStyles.text]}>
            {convertFIrstCharToUpper(item.appointmentStatus)}
          </Text>
        </View>
      </View>
    </View>
  );
};

const AllAppointments = () => {
  const { user } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && user.uid) {
      const fetchAppointmentHistory = async () => {
        setLoading(true);
        const res = await getAppointmentsByCustomerId(user.uid);
        setLoading(false);
        if (res) {
          setAppointments(res);
        }
      };
      fetchAppointmentHistory();
    }
  }, [user]);

  return (
    <View style={styles.outerContainer}>
      <StatusBar backgroundColor={primaryColor} barStyle="light-content" />

      {loading ? (
        <Loader />
      ) : appointments.length == 0 ? (
        <EmptyComponent />
      ) : (
        <View style={styles.container}>
          <Text style={styles.mainTitle}>Appointment History</Text>
          <View style={styles.headerRow}>
            <Text style={[styles.headerText, { flex: 1.5 }]}>
              Beauty Expert
            </Text>
            <Text style={[styles.headerText, { flex: 1.2 }]}>Description</Text>
            <Text
              style={[styles.headerText, { flex: 0.8, textAlign: 'right' }]}
            >
              Status
            </Text>
          </View>
          <FlatList
            data={appointments}
            renderItem={({ item }) => <HistoryItem item={item} />}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        </View>
      )}
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
  descriptionColumn: {
    flex: 1.2,
  },
  descriptionText: {
    fontSize: 12,
    color: '#555',
    lineHeight: 20,
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
});

export default AllAppointments;
