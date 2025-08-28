import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  Modal,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { primaryColor } from '../../constants/colors';
import { APPOINTMENT_STATUSES } from '../../constants/variables';
import { AuthContext } from '../../context/AuthContext';
import { createAppointment } from '../../apis/services';

const Row = ({ label, value }) => (
  <View style={styles.row}>
    <Text style={styles.text}>{label}</Text>
    <Text style={styles.text}>{value}</Text>
  </View>
);

const AmountRow = ({ service, qty, price, isBold = false }) => (
  <View style={styles.amountRow}>
    <Text style={[styles.amountCell, { flex: 2 }, isBold && styles.boldText]}>
      {service}
    </Text>
    <Text style={[styles.amountCell, isBold && styles.boldText]}>{qty}</Text>
    <Text
      style={[
        styles.amountCell,
        { textAlign: 'right' },
        isBold && styles.boldText,
      ]}
    >
      {price}
    </Text>
  </View>
);

const BookingSummaryScreen = ({ route, navigation }) => {
  const { user } = useContext(AuthContext);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedServices, setSelectedServices] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (route.params) {
      const { selectedDate, selectedTime, selectedServices } = route.params;
      setSelectedDate(selectedDate);
      setSelectedTime(selectedTime);
      setSelectedServices(selectedServices);

      const calculatedSubtotal = selectedServices.reduce(
        (sum, service) => sum + service.servicePrice,
        0,
      );
      setSubtotal(calculatedSubtotal);
    }
  }, [route.params]);

  const total = subtotal;

  const handleConfirmBooking = async () => {
    setConfirming(true);

    if (user && user.uid) {
      const serviceIds = selectedServices.map(service => service.id);

      const bookingData = {
        serviceIds,
        selectedDate,
        selectedTime,
        appointmentStatus: APPOINTMENT_STATUSES.PENDING,
        customerId: user.uid,
        totalAmount: subtotal,
        shopId: route.params.shopId
      };

      try {
        const res = await createAppointment(bookingData);

        if (res && res.success) {
          setModalVisible(true);
        }
      } catch (error) {
        console.error('Error creating appointment:', error);
      } finally {
        setConfirming(false);
      }
    } else {
      setConfirming(false);
      console.warn('User not logged in or user ID not available.');
    }
  };

  return (
    <View style={styles.outerContainer}>
      <StatusBar backgroundColor={primaryColor} barStyle="light-content" />

      <Modal
        transparent={true}
        visible={modalVisible}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            <View style={styles.successIconContainer}>
              <Ionicons name="checkmark" size={36} color="#fff" />
            </View>
            <Text style={styles.modalText}>
              Successfully sent your request. Waiting for confirmation.
            </Text>
            <TouchableOpacity
              style={styles.okButton}
              onPress={() => {
                setModalVisible(false);

                navigation.navigate('Appointment');
              }}
            >
              <Text style={styles.okButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal transparent={true} visible={confirming} animationType="fade">
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Sending Booking request ...</Text>
        </View>
      </Modal>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
        disabled={confirming}
      >
        <Ionicons name="chevron-back" size={24} color="#fff" />
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>

      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.mainTitle}>Service Summary</Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Date & Time</Text>
            <Row label="Date" value={selectedDate} />
            <Row label="Time" value={selectedTime} />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Amount</Text>
            <View>
              <View style={styles.amountHeader}>
                <Text style={[styles.amountCell, styles.boldText, { flex: 2 }]}>
                  Service
                </Text>
                <Text style={[styles.amountCell, styles.boldText]}>
                  Quantity
                </Text>
                <Text
                  style={[
                    styles.amountCell,
                    styles.boldText,
                    { textAlign: 'right' },
                  ]}
                >
                  Price
                </Text>
              </View>
              {selectedServices.map((service, index) => (
                <AmountRow
                  key={index}
                  service={service.serviceName}
                  qty="01"
                  price={`${service.servicePrice}`}
                />
              ))}
            </View>

            <View style={styles.separator} />

            <AmountRow service="Subtotal" qty="" price={`${subtotal}`} />

            <View style={styles.separator} />

            <AmountRow
              service="Total"
              qty=""
              price={`${total}`}
              isBold={true}
            />
          </View>
        </ScrollView>
        <TouchableOpacity
          style={[styles.confirmButton, confirming && styles.disabledButton]}
          onPress={handleConfirmBooking}
          disabled={confirming}
        >
          {confirming ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.confirmButtonText}>Confirm</Text>
          )}
        </TouchableOpacity>
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
    paddingHorizontal: 25,
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: '400',
    color: '#333',
    textAlign: 'center',
    marginVertical: 25,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '500',
    color: '#333',
    marginBottom: 15,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  text: {
    fontSize: 16,
    color: '#555',
  },
  amountHeader: {
    flexDirection: 'row',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    marginBottom: 10,
  },
  amountRow: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  amountCell: {
    flex: 1,
    fontSize: 16,
    color: '#555',
  },
  boldText: {
    fontWeight: 'bold',
    color: '#333',
  },
  separator: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 10,
  },
  confirmButton: {
    backgroundColor: primaryColor,
    padding: 18,
    borderRadius: 15,
    alignItems: 'center',
    marginVertical: 10,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: '85%',
    alignItems: 'center',
    overflow: 'hidden',
  },
  successIconContainer: {
    backgroundColor: primaryColor,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  modalText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
    marginVertical: 25,
    paddingHorizontal: 20,
    lineHeight: 26,
  },
  okButton: {
    backgroundColor: '#111',
    width: '100%',
    padding: 20,
    alignItems: 'center',
  },
  okButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
    marginTop: 10,
  },
});

export default BookingSummaryScreen;
