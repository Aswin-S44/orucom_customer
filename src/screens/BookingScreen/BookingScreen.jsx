import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  StatusBar,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Calendar } from 'react-native-calendars';
import { lightPurple, primaryColor } from '../../constants/colors';
import BookingScreenSkeleton from '../../components/BookingScreenSkeleton/BookingScreenSkeleton';
import { NO_IMAGE } from '../../constants/images';
import firestore from '@react-native-firebase/firestore';
import moment from 'moment';
import { AuthContext } from '../../context/AuthContext';

const BookingScreen = ({ route, navigation }) => {
  const { user, userData } = useContext(AuthContext);

  const [selectedExpert, setSelectedExpert] = useState(
    route?.params?.selectedExpertId ?? null,
  );
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedServices, setSelectedServices] = useState(null);
  const [loading, setLoading] = useState(false);
  const [slots, setSlots] = useState({});
  const [selectedDate, setSelectedDate] = useState(
    moment().format('YYYY-MM-DD'),
  );
  const [expertsLoading, setExpertsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const formattedDate = selectedDate;
  const slotsForDate = slots[formattedDate] || [];

  const { shopId, serviceId, experts, service, offers } = route.params;

  useEffect(() => {
    if (!route.params?.shopId) return;

    setLoading(true);

    const unsubscribe = firestore()
      .collection('slots')
      .where('shopId', '==', route.params.shopId)
      .onSnapshot(
        querySnapshot => {
          const slotsData = {};

          querySnapshot.forEach(doc => {
            const slot = { id: doc.id, ...doc.data() };
            const slotDate = slot.date;

            if (!slotsData[slotDate]) {
              slotsData[slotDate] = [];
            }

            slotsData[slotDate].push(slot);
          });

          setSlots(slotsData);
          setLoading(false);
        },
        error => {
          console.error('Error fetching slots:', error);
          setLoading(false);
          Alert.alert('Error', 'Failed to load slots');
        },
      );

    return () => unsubscribe();
  }, [route]);

  useEffect(() => {
    if (service) {
      setSelectedServices([service]);
    }
  }, [route]);

  useEffect(() => {
    if (!selectedExpert) {
      setErrorMessage('Please select a beauty expert.');
    } else if (!selectedDate) {
      setErrorMessage('Please select a date.');
    } else if (!selectedTime) {
      setErrorMessage('Please select a time slot.');
    } else if (!selectedServices || selectedServices.length === 0) {
      setErrorMessage('Please select a service.');
    } else {
      setErrorMessage('');
    }
  }, [selectedExpert, selectedDate, selectedTime, selectedServices]);

  const onDayPress = day => {
    setSelectedDate(day.dateString);
    setSelectedTime(null);
  };

  const handleNext = () => {
    navigation.navigate('BookingSummaryScreen', {
      selectedDate: selectedDate,
      selectedTime: selectedTime,
      selectedServices: selectedServices,
      selectedExpert: experts.find(expert => expert.id === selectedExpert),
      shopId,
      offers: route.params.offers,
    });
  };

  const markedDates = {
    [selectedDate]: {
      selected: true,
      disableTouchEvent: true,
      selectedColor: primaryColor,
      selectedTextColor: '#ffffff',
    },
  };

  Object.keys(slots).forEach(date => {
    if (slots[date].length > 0) {
      markedDates[date] = {
        ...(markedDates[date] || {}),
        marked: true,
        dotColor: primaryColor,
      };
    }
  });

  if (loading) {
    return <BookingScreenSkeleton />;
  }

  const handleTimeSlotPress = slot => {
    const now = moment();
    const slotDateTime = moment(
      `${selectedDate} ${slot.startTime}`,
      'YYYY-MM-DD HH:mm',
    );

    if (moment(selectedDate).isSame(now, 'day') && slotDateTime.isBefore(now)) {
      Alert.alert('Invalid Time', 'Please choose an upcoming time slot.');
      return;
    }

    setSelectedTime(slot);
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
          <Text style={styles.mainTitle}>Book Your Appointment</Text>
          {errorMessage ? (
            <Text style={styles.errorMessage}>{errorMessage}</Text>
          ) : null}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Choose Your Beauty Expert</Text>
            {expertsLoading && (
              <Text style={styles.loadingText}>Please wait....</Text>
            )}

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.expertScroll}
            >
              {expertsLoading ? (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.expertScroll}
                >
                  {[...Array(4)].map((_, index) => (
                    <View key={index} style={styles.expertCard}>
                      <View style={styles.avatarContainer}>
                        <View style={styles.avatar} />
                      </View>
                      <View style={styles.expertNameSkeleton} />
                    </View>
                  ))}
                </ScrollView>
              ) : !loading && experts.length === 0 ? (
                <Text style={styles.noExpertsText}>No experts available</Text>
              ) : (
                experts.map(expert => (
                  <View key={expert.id} style={styles.expertItem}>
                    <TouchableOpacity
                      style={styles.expertCard}
                      onPress={() => {
                        setSelectedExpert(expert.id);
                      }}
                    >
                      <View style={styles.avatarContainer}>
                        <Image
                          source={{
                            uri:
                              typeof expert.imageUrl === 'string'
                                ? expert.imageUrl
                                : NO_IMAGE,
                          }}
                          style={styles.avatar}
                        />

                        {selectedExpert === expert.id && (
                          <View style={styles.avatarOverlay}>
                            <Ionicons
                              name="checkmark-circle"
                              size={28}
                              color="#fff"
                              style={styles.checkIcon}
                            />
                          </View>
                        )}
                      </View>
                      <Text style={styles.expertName}>
                        {expert.expertName ?? ''}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.viewDetailsButton}
                      onPress={() => {
                        navigation.navigate('BeautyExpertDetailsScreen', {
                          expertId: expert.id,
                        });
                      }}
                    >
                      <Ionicons name="eye" size={18} color={primaryColor} />
                      <Text style={styles.viewDetailsText}>View Details</Text>
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </ScrollView>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Date</Text>
            <Calendar
              onDayPress={onDayPress}
              markedDates={markedDates}
              theme={{
                selectedDayBackgroundColor: primaryColor,
                selectedDayTextColor: '#ffffff',
                todayTextColor: primaryColor,
                arrowColor: primaryColor,
                dotColor: primaryColor,
                textDayFontSize: 16,
                textMonthFontSize: 16,
                textDayHeaderFontSize: 14,
                'stylesheet.calendar.header': {
                  week: {
                    marginTop: 5,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  },
                },
              }}
              minDate={moment().format('YYYY-MM-DD')}
              style={styles.calendar}
            />
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Select Time Slot</Text>
              <View style={styles.legendContainer}>
                <View
                  style={[styles.legendDot, { backgroundColor: primaryColor }]}
                />
                <Text style={styles.legendText}>Available</Text>
                <View
                  style={[styles.legendDot, { backgroundColor: lightPurple }]}
                />
                <Text style={styles.legendText}>Booked</Text>
              </View>
            </View>
            <View style={styles.timeSlotsContainer}>
              {slotsForDate.length === 0 ? (
                <Text style={styles.noSlotsText}>
                  No slots available for this date
                </Text>
              ) : (
                slotsForDate.map(slot => {
                  const slotLabel = `${slot.startTime} - ${slot.endTime}`;
                  const isSelected = selectedTime?.id === slot.id;
                  const isDisabled = !slot.isAvailable;
                  const isPastTime =
                    moment(selectedDate).isSame(moment(), 'day') &&
                    moment(
                      `${selectedDate} ${slot.startTime}`,
                      'YYYY-MM-DD HH:mm',
                    ).isBefore(moment());

                  return (
                    <TouchableOpacity
                      key={slot.id}
                      onPress={() => handleTimeSlotPress(slot)}
                      disabled={isDisabled || isPastTime}
                      style={[
                        styles.timeSlot,
                        isSelected && styles.timeSlotSelected,
                        (isDisabled || isPastTime) && styles.timeSlotDisabled,
                      ]}
                    >
                      <Text
                        style={[
                          styles.timeSlotText,
                          isSelected && styles.timeSlotTextSelected,
                          (isDisabled || isPastTime) &&
                            styles.timeSlotTextDisabled,
                        ]}
                      >
                        {slotLabel}
                      </Text>
                    </TouchableOpacity>
                  );
                })
              )}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Service Amount</Text>
            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text
                  style={[
                    styles.tableCell,
                    styles.tableHeaderText,
                    { flex: 2 },
                  ]}
                >
                  Service
                </Text>
                <Text style={[styles.tableCell, styles.tableHeaderText]}>
                  Quantity
                </Text>
                <Text
                  style={[
                    styles.tableCell,
                    styles.tableHeaderText,
                    { textAlign: 'right' },
                  ]}
                >
                  Price
                </Text>
              </View>
              {selectedServices &&
                selectedServices.length > 0 &&
                selectedServices.map(service => (
                  <View key={service.id} style={styles.tableRow}>
                    <Text style={[styles.tableCell, { flex: 2 }]}>
                      {service.serviceName}
                    </Text>
                    <Text style={styles.tableCell}>{service.qty ?? 1}</Text>
                    <Text style={[styles.tableCell, { textAlign: 'right' }]}>
                      {service.servicePrice}
                    </Text>
                  </View>
                ))}
            </View>
          </View>
        </ScrollView>
        <TouchableOpacity
          style={[
            styles.nextButton,
            (!selectedTime ||
              !selectedServices ||
              !selectedDate ||
              !selectedExpert) &&
              styles.disabledButton,
          ]}
          onPress={handleNext}
          disabled={
            !selectedTime ||
            !selectedServices ||
            !selectedDate ||
            !selectedExpert
          }
        >
          <Text style={styles.nextButtonText}>NEXT</Text>
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
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  scrollViewContent: {
    paddingBottom: 20,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 15,
  },
  errorMessage: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 14,
  },
  section: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  loadingText: {
    textAlign: 'center',
    color: '#888',
    marginTop: 10,
  },
  expertScroll: {
    paddingVertical: 10,
  },
  expertItem: {
    marginRight: 15,
    alignItems: 'center',
  },
  expertCard: {
    alignItems: 'center',
    padding: 5,
    borderRadius: 15,
    backgroundColor: '#f9f9f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 8,
    backgroundColor: '#e0e0e0',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#eee',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
  },
  avatarOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(142, 68, 173, 0.7)',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: primaryColor,
    borderRadius: 14,
  },
  expertName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginTop: 5,
  },
  expertNameSkeleton: {
    width: 60,
    height: 14,
    borderRadius: 4,
    backgroundColor: '#d0d0d0',
  },
  noExpertsText: {
    color: '#888',
    textAlign: 'center',
    marginTop: 10,
    width: '100%',
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  viewDetailsText: {
    fontSize: 12,
    color: primaryColor,
    marginLeft: 5,
  },
  calendar: {
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingBottom: 5,
  },
  legendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
    marginLeft: 10,
  },
  legendText: {
    fontSize: 13,
    color: '#888',
  },
  timeSlotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  timeSlot: {
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginBottom: 10,
    width: '48%',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  timeSlotSelected: {
    backgroundColor: primaryColor,
    borderColor: primaryColor,
  },
  timeSlotDisabled: {
    backgroundColor: '#e0e0e0',
    borderColor: '#d0d0d0',
    opacity: 0.7,
  },
  timeSlotText: {
    color: '#555',
    fontWeight: '500',
    fontSize: 13,
  },
  timeSlotTextSelected: {
    color: '#fff',
  },
  timeSlotTextDisabled: {
    color: '#a0a0a0',
  },
  noSlotsText: {
    color: '#888',
    textAlign: 'center',
    marginTop: 10,
    width: '100%',
  },
  table: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 15,
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
    alignItems: 'center',
  },
  tableHeader: {
    backgroundColor: '#f8f8f8',
  },
  tableCell: {
    flex: 1,
    fontSize: 14,
    color: '#555',
  },
  tableHeaderText: {
    fontWeight: '700',
    color: '#333',
  },
  nextButton: {
    backgroundColor: primaryColor,
    padding: 16,
    borderRadius: 15,
    alignItems: 'center',
    marginVertical: 15,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default BookingScreen;
