import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  Linking,
  Image,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { DEFAULT_AVATAR, NO_IMAGE } from '../../constants/images';
import { formatDate } from '../../utils/utils';
import { primaryColor } from '../../constants/colors';

const Row = ({ label, value }) => (
  <View style={styles.row}>
    <Text style={styles.text}>{label}</Text>
    <Text style={styles.valueText}>{value}</Text>
  </View>
);

const AppointmentSummaryScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const item = route?.params?.item;

  const shop = item?.shop;
  const appointment = item?.appointment;
  const expert = item?.expert;
  const slot = item?.slot;
  const status = item?.status?.name || 'pending';

  const getStatusStyle = statusName => {
    switch (statusName?.toLowerCase()) {
      case 'confirmed':
        return styles.statusConfirmed;
      case 'pending':
        return styles.statusPending;
      case 'cancelled':
      case 'canceled':
        return styles.statusCancelled;
      default:
        return styles.statusDefault;
    }
  };

  const handleCall = phoneNumber => {
    if (phoneNumber) {
      Linking.openURL(`tel:${phoneNumber}`);
    }
  };

  const handleOpenGoogleMaps = address => {
    const url = Platform.select({
      ios: `maps:0,0?q=${address}`,
      android: `geo:0,0?q=${address}`,
    });
    Linking.openURL(url);
  };

  return (
    <View style={styles.outerContainer}>
      <StatusBar backgroundColor={primaryColor} barStyle="light-content" />

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="chevron-back" size={24} color="#fff" />
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>

      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollViewContent}
        >
          <Text style={styles.mainTitle}>Appointment Summary</Text>

          <View style={styles.profileSection}>
            <Image
              source={{ uri: shop?.shopImage || NO_IMAGE }}
              style={styles.avatar}
            />
            <Text style={styles.expertName}>{shop?.parlourName || 'N/A'}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Appointment Details</Text>
            <Row
              label="Date"
              value={slot?.slotDate ? formatDate(slot.slotDate) : 'N/A'}
            />
            <Row
              label="Time"
              value={
                slot?.startTime ? `${slot.startTime} - ${slot.endTime}` : 'N/A'
              }
            />
            <Row label="Expert" value={expert?.name || 'N/A'} />
            <Row label="Total Rate" value={`₹${appointment?.rate || 0}`} />
            <View style={styles.row}>
              <Text style={styles.text}>Status</Text>
              <Text style={[styles.statusText, getStatusStyle(status)]}>
                {status.toUpperCase()}
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Shop Details</Text>
            <Row label="Address" value={shop?.address || 'N/A'} />

            {shop?.phone && (
              <View style={styles.row}>
                <Text style={styles.text}>Phone</Text>
                <TouchableOpacity
                  onPress={() => handleCall(shop.phone)}
                  style={styles.phoneButton}
                >
                  <Text style={styles.phoneText}>{shop.phone}</Text>
                  <Icon name="call" size={20} color="green" />
                </TouchableOpacity>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={styles.visitUsButton}
            onPress={() => handleOpenGoogleMaps(shop?.address)}
          >
            <Text style={styles.visitUsButtonText}>View Location</Text>
            <Ionicons name="location-outline" size={20} color="#fff" />
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: primaryColor,
  },
  backButton: {
    position: 'absolute',
    top: 55,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 18,
    marginLeft: 5,
  },
  container: {
    flex: 1,
    marginTop: 100,
    backgroundColor: '#fff',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
  },
  scrollViewContent: {
    paddingHorizontal: 25,
    paddingTop: 25,
    paddingBottom: 40,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 30,
  },
  section: {
    marginBottom: 20,
    backgroundColor: '#f9f9f9',
    borderRadius: 15,
    padding: 20,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  text: {
    fontSize: 15,
    color: '#666',
    fontWeight: '500',
  },
  valueText: {
    fontSize: 15,
    color: '#333',
    fontWeight: '600',
    textAlign: 'right',
    flexShrink: 1,
    marginLeft: 10,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 25,
  },
  expertName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 12,
    textAlign: 'center',
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    borderColor: primaryColor,
  },
  statusText: {
    fontSize: 13,
    fontWeight: 'bold',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    overflow: 'hidden',
  },
  statusConfirmed: {
    backgroundColor: '#E8F5E9',
    color: '#2E7D32',
  },
  statusPending: {
    backgroundColor: '#FFF8E1',
    color: '#F9A825',
  },
  statusCancelled: {
    backgroundColor: '#FFEBEE',
    color: '#C62828',
  },
  statusDefault: {
    backgroundColor: '#F5F5F5',
    color: '#616161',
  },
  phoneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  phoneText: {
    fontSize: 15,
    color: '#2E7D32',
    marginRight: 6,
    fontWeight: '600',
  },
  visitUsButton: {
    flexDirection: 'row',
    backgroundColor: primaryColor,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  visitUsButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
});

export default AppointmentSummaryScreen;
