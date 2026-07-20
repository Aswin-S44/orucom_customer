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
  Dimensions,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
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

const { width } = Dimensions.get('window');

const getStatusStyles = status => {
  switch (status) {
    case 'pending':
      return {
        container: { backgroundColor: '#FFF0F6', borderColor: '#FFD6E7' },
        text: { color: '#D41172' },
      };
    case 'completed':
      return {
        container: { backgroundColor: '#F3E5F5', borderColor: '#E1BEE7' },
        text: { color: '#7B1FA2' },
      };
    case 'confirmed':
      return {
        container: { backgroundColor: '#D41172', borderColor: '#D41172' },
        text: { color: '#FFFFFF' },
      };
    case 'canceled':
      return {
        container: { backgroundColor: '#F8F9FA', borderColor: '#E9ECEF' },
        text: { color: '#6C757D' },
      };
    default:
      return {
        container: { backgroundColor: '#F8F9FA', borderColor: '#E9ECEF' },
        text: { color: '#6C757D' },
      };
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

  const numberOfPeople = item?.appointment?.numberOfPeople || 1;
  const totalRate = item?.appointment?.rate || 0;
  const unitPrice =
    numberOfPeople > 0 ? Math.round(totalRate / numberOfPeople) : totalRate;

  // Handle specialist field - it could be array, string, or undefined
  const getSpecialistText = specialist => {
    if (!specialist) return 'Stylist';
    if (Array.isArray(specialist)) {
      return specialist.length > 0 ? specialist.join(', ') : 'Stylist';
    }
    if (typeof specialist === 'string') {
      return formatText(specialist);
    }
    return 'Stylist';
  };

  const specialistText = getSpecialistText(item?.expert?.specialist);

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={() => {
        navigation.navigate('AppointmentSummaryScreen', { item });
      }}
    >
      <View style={styles.cardHeader}>
        <View style={styles.shopInfo}>
          <Ionicons name="business" size={16} color={primaryColor} />
          <Text style={styles.shopName} numberOfLines={1}>
            {item?.shop?.parlourName || 'Unknown Shop'}
          </Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            statusStyles.container,
            { borderWidth: 1 },
          ]}
        >
          <Text style={[styles.statusText, statusStyles.text]}>
            {convertFIrstCharToUpper(appointmentStatus)}
          </Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <Image source={{ uri: expertImageUrl }} style={styles.expertAvatar} />
        <View style={styles.mainDetails}>
          <Text style={styles.expertName}>
            {item?.expert?.name || 'Unknown Expert'}
          </Text>
          <Text style={styles.specialtyText} numberOfLines={1}>
            {specialistText}
          </Text>

          <View style={styles.dateTimeRow}>
            <Ionicons name="calendar-outline" size={14} color="#6B7280" />
            <Text style={styles.dateText}>
              {formatTimestamp(item?.appointment?.createdAt)}
            </Text>
          </View>

          <View style={styles.quantityRow}>
            <Ionicons name="people-outline" size={14} color="#6B7280" />
            <Text style={styles.quantityText}>Quantity: {numberOfPeople}</Text>
          </View>
        </View>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Total</Text>
          <Text style={styles.priceValue}>₹{totalRate}</Text>
          {numberOfPeople > 1 && (
            <Text style={styles.unitPriceText}>₹{unitPrice} each</Text>
          )}
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

      const url = `${BACKEND_URL}/api/v1/customer/appointments`;

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
    <View style={styles.mainContainer}>
      <StatusBar backgroundColor={primaryColor} barStyle="light-content" />

      <View style={styles.headerBackground}>
        <Text style={styles.headerTitle}>My Appointments</Text>
        <Text style={styles.headerSubtitle}>Manage your beauty sessions</Text>
      </View>

      <View style={styles.listWrapper}>
        <FlatList
          data={appointments}
          renderItem={({ item }) => (
            <HistoryItem item={item} navigation={navigation} />
          )}
          keyExtractor={(item, index) => String(item?.appointment?.id || index)}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            !loading && <EmptyComponent title="No appointments scheduled yet" />
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[primaryColor]}
              tintColor={primaryColor}
            />
          }
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#F8F9FE',
  },
  headerBackground: {
    backgroundColor: primaryColor,
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 25,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 5,
  },
  listWrapper: {
    flex: 1,
    marginTop: -20,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    paddingTop: 10,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#D41172',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    marginBottom: 12,
  },
  shopInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  shopName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
    marginLeft: 6,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  cardBody: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expertAvatar: {
    width: 60,
    height: 60,
    borderRadius: 15,
    backgroundColor: '#F3F4F6',
  },
  mainDetails: {
    flex: 1,
    marginLeft: 15,
  },
  expertName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  specialtyText: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  dateTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  dateText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  quantityText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  priceContainer: {
    alignItems: 'flex-end', 
  },
  priceLabel: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '800',
    color: primaryColor,
  },
  unitPriceText: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F9FAFB',
  },
  viewDetailsText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '600',
    marginRight: 4,
  },
});

export default AllAppointments;
