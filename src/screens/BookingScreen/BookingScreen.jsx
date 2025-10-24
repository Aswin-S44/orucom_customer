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
    route?.selectedExpert ?? null,
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
      selectedDotColor: 'orange',
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
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.mainTitle}>Appointment</Text>
          {errorMessage ? (
            <Text style={styles.errorMessage}>{errorMessage}</Text>
          ) : null}

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Choose Your Beauty Expert</Text>
            <View style={styles.navIcons}>
              <Ionicons name="chevron-back" size={20} color="#888" />
              <Ionicons name="chevron-forward" size={20} color="#333" />
            </View>
          </View>
          {expertsLoading && <Text>Please wait....</Text>}

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
                    <View style={styles.expertName} />
                  </View>
                ))}
              </ScrollView>
            ) : !loading && experts.length == 0 ? (
              <>
                <Text>No experts available</Text>
              </>
            ) : (
              experts.map(expert => (
                <View key={expert.id}>
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
                        <View style={styles.avatarOverlay} />
                      )}
                    </View>
                    <Text style={styles.expertName}>
                      {expert.expertName ?? ''}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.expertCard, { marginTop: 5 }]}
                    onPress={() => {
                      navigation.navigate('BeautyExpertDetailsScreen', {
                        expertId: expert.id,
                      });
                    }}
                  >
                    <Ionicons name="eye" size={18} color="#111" />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </ScrollView>

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
            }}
            minDate={moment().format('YYYY-MM-DD')}
            style={styles.calendar}
          />

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
              <Text style={{ color: '#888', textAlign: 'center' }}>
                No slots available for this date
              </Text>
            ) : (
              slotsForDate.map(slot => {
                const slotLabel = `${slot.startTime} - ${slot.endTime}`;
                const isSelected = selectedTime?.id === slot.id;
                const isDisabled = !slot.isAvailable;

                return (
                  <TouchableOpacity
                    key={slot.id}
                    onPress={() => !isDisabled && setSelectedTime(slot)}
                    disabled={isDisabled}
                    style={[
                      styles.timeSlot,
                      isSelected && styles.timeSlotSelected,
                      isDisabled && { backgroundColor: '#d8b4fe' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.timeSlotText,
                        isSelected && styles.timeSlotTextSelected,
                        isDisabled && { color: '#aaa' },
                      ]}
                    >
                      {slotLabel}
                    </Text>
                  </TouchableOpacity>
                );
              })
            )}
          </View>

          <Text style={styles.sectionTitle}>Service Amount</Text>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text
                style={[styles.tableCell, styles.tableHeaderText, { flex: 2 }]}
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
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 25,
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: '400',
    color: '#333',
    textAlign: 'center',
    marginTop: 25,
    marginBottom: 10,
  },
  errorMessage: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 15,
    fontSize: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
  },
  navIcons: {
    flexDirection: 'row',
  },
  expertScroll: {
    paddingBottom: 25,
  },
  expertCard: {
    alignItems: 'center',
    marginRight: 20,
  },
  avatarContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginBottom: 8,
    backgroundColor: '#e0e0e0',
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 35,
    backgroundColor: '#d0d0d0',
  },
  avatarOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(142, 68, 173, 0.6)',
    borderRadius: 35,
  },
  expertName: {
    fontSize: 14,
    color: '#555',
  },
  calendar: {
    borderRadius: 12,
    marginBottom: 25,
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
    fontSize: 14,
    color: '#888',
  },
  timeSlotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginBottom: 25,
    gap: 10,
  },
  timeSlot: {
    backgroundColor: lightPurple,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'flex-start',
    marginBottom: 10,
    width: '30%',
  },
  timeSlotSelected: {
    backgroundColor: primaryColor,
  },
  timeSlotText: {
    color: primaryColor,
    fontWeight: '600',
    left: 10,
    fontSize: 12,
  },
  timeSlotTextSelected: {
    color: '#fff',
  },
  table: {
    borderWidth: 1,
    borderColor: '#F0F0F0',
    borderRadius: 12,
    marginBottom: 20,
  },
  tableRow: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  tableHeader: {
    backgroundColor: '#FAFAFA',
  },
  tableCell: {
    flex: 1,
    fontSize: 15,
    color: '#555',
  },
  tableHeaderText: {
    fontWeight: 'bold',
    color: '#333',
  },
  nextButton: {
    backgroundColor: primaryColor,
    padding: 18,
    borderRadius: 15,
    alignItems: 'center',
    marginVertical: 10,
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
