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
import {
  APPOINTMENT_STATUSES,
  APPOINTMENT_TYPES,
} from '../../constants/variables';
import { AuthContext } from '../../context/AuthContext';
import {
  createAppointment,
  createNotification,
  getOfferByServiceAndShop,
  sendAppointmentNofification,
  updateSlotInFirestore,
} from '../../apis/services';
import { firestore } from '../../config/firebase';

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
  const { user, userId } = useContext(AuthContext);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedServices, setSelectedServices] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [confirming, setConfirming] = useState(false);
  const [selectedExpert, setSelectedExpert] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [loadingSummary, setLoadingSummary] = useState(true);

  useEffect(() => {
    if (route.params) {
      const fetchData = async () => {
        console.log('222222222222');
        setLoadingSummary(true);
        const {
          selectedDate,
          selectedTime,
          selectedServices,
          selectedExpert,
          offers,
        } = route.params;

        const [year, month, day] = selectedDate.split('-');
        const formattedDate = `${day}-${month}-${year}`;
        setSelectedDate(formattedDate);
        console.log('33333333333');

        const formatTime = time => {
          const [hours, minutes] = time.split(':');
          const hour = parseInt(hours, 10);
          const ampm = hour >= 12 ? 'pm' : 'am';
          const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
          return `${formattedHour}${ampm}`;
        };

        const formattedStartTime = formatTime(selectedTime.startTime);
        const formattedEndTime = formatTime(selectedTime.endTime);
        setSelectedTime(`${formattedStartTime} - ${formattedEndTime}`);
        console.log('4444444444');
        console.log(
          'selectedServices-------------',
          selectedServices ? selectedServices : 'no selectedServices',
        );
        console.log('offers----------', offers ? offers : 'no offers');
        const updatedServices = await Promise.all(
          selectedServices.map(async service => {
            // Check if offers array exists and has at least one element
            if (
              offers &&
              offers.length > 0 &&
              offers[0].offerPrice !== undefined
            ) {
              return { ...service, offerPrice: offers[0].offerPrice };
            }
            // If no offer or offerPrice is undefined, return the service as is or with a default 0
            return { ...service, offerPrice: 0 }; // Or simply 'return service;' if you don't want to add offerPrice
          }),
        );
        console.log(
          '11111111111111111',
          updatedServices ? updatedServices : 'no updatedServices',
        );
        setSelectedServices(updatedServices);

        setSelectedExpert(selectedExpert.id);
        setSelectedSlot(selectedTime);

        const calculatedSubtotal = updatedServices.reduce(
          (sum, service) => sum + (service.offerPrice || service.servicePrice),
          0,
        );
        setSubtotal(calculatedSubtotal);
        setLoadingSummary(false);
      };
      fetchData();
    }
  }, [route.params]);

  const total = subtotal;

  // const updateSlotInFirestore = async (slotId, slotData) => {
  //   try {
  //     await firestore()
  //       .collection('slots')
  //       .doc(slotId)
  //       .update({
  //         ...slotData,
  //         updatedAt: new Date(),
  //       });
  //     return { success: true };
  //   } catch (error) {
  //     console.error('Error updating slot:', error);
  //     throw error;
  //   }
  // };

  // const handleConfirmBooking = async () => {
  //   setConfirming(true);
  //   if (userId) {
  //     const serviceIds = selectedServices.map(service => service.id);

  //     const bookingData = {
  //       serviceIds,
  //       selectedDate,
  //       selectedTime,
  //       appointmentStatus: APPOINTMENT_STATUSES.PENDING,
  //       customerId: userId,
  //       totalAmount: subtotal,
  //       shopId: route.params.shopId,
  //       expertId: selectedExpert,
  //     };

  //     try {
  //       const res = await createAppointment(userId, bookingData);
  //       await updateSlotInFirestore(selectedSlot.id, { isAvailable: false });
  //       await createNotification(
  //         userId,
  //         route.params.shopId,
  //         res?.id ?? null,
  //       );

  //       if (res && res.success) {
  //         setModalVisible(true);

  //         sendAppointmentNofification(
  //           userId,
  //           route.params.shopId,
  //           APPOINTMENT_TYPES.BOOKING_REQUEST_SENT,
  //           res?.id ?? null,
  //         ).catch(err =>
  //           console.log('Notification failed (non-blocking):', err),
  //         );
  //       }
  //     } catch (error) {
  //       console.error('Error creating appointment:', error);
  //     } finally {
  //       setConfirming(false);
  //     }
  //   } else {
  //     setConfirming(false);
  //   }
  // };

  const handleConfirmBooking = async () => {
    if (!userId) return;

    setConfirming(true);
    const serviceIds = selectedServices.map(s => s.id);

    const bookingData = {
      serviceIds,
      selectedDate,
      selectedTime,
      appointmentStatus: APPOINTMENT_STATUSES.PENDING,
      customerId: userId,
      totalAmount: subtotal,
      shopId: route.params.shopId,
      expertId: selectedExpert,
    };

    try {
      const appointmentPromise = createAppointment(userId, bookingData);
      const slotPromise = updateSlotInFirestore(selectedSlot.id, {
        isAvailable: false,
      });

      const [appointmentRes] = await Promise.all([
        appointmentPromise,
        slotPromise,
      ]);
      if (!appointmentRes?.success)
        throw new Error('Failed to create appointment');

      const notificationPromise = createNotification(
        userId,
        route.params.shopId,
        appointmentRes.id ?? null,
      );

      const sendNotificationPromise = sendAppointmentNofification(
        userId,
        route.params.shopId,
        APPOINTMENT_TYPES.BOOKING_REQUEST_SENT,
        appointmentRes.id ?? null,
      );

      await Promise.allSettled([notificationPromise]);
      setModalVisible(true);
    } catch (error) {
      console.error('Error creating appointment:', error);
    } finally {
      setConfirming(false);
    }
  };

  const handleModalClose = () => {
    setModalVisible(false);
    navigation.navigate('Appointment', { newAppointment: true });
  };

  return (
    <View style={styles.outerContainer}>
      <StatusBar backgroundColor={primaryColor} barStyle="light-content" />

      <Modal
        transparent={true}
        visible={modalVisible}
        animationType="fade"
        onRequestClose={handleModalClose}
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
              onPress={handleModalClose}
            >
              <Text style={styles.okButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
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
        {loadingSummary ? (
          <View style={styles.summaryLoadingContainer}>
            <ActivityIndicator size="large" color={primaryColor} />
            <Text style={styles.summaryLoadingText}>Loading summary...</Text>
          </View>
        ) : (
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
                  <Text
                    style={[styles.amountCell, styles.boldText, { flex: 2 }]}
                  >
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
                    price={`${service.offerPrice || service.servicePrice}`}
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
        )}
        <TouchableOpacity
          // style={[styles.confirmButton, confirming && styles.disabledButton]}
          style={[styles.confirmButton]}
          onPress={handleConfirmBooking}
          //disabled={confirming || loadingSummary}
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
  summaryLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryLoadingText: {
    marginTop: 10,
    fontSize: 18,
    color: '#555',
  },
});

export default BookingSummaryScreen;
