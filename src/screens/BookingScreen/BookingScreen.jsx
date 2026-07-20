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
import moment from 'moment';
import { AuthContext } from '../../context/AuthContext';
import { BACKEND_URL } from '../../services/apis';

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
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [expertsLoading, setExpertsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [quantity, setQuantity] = useState(1);

  const formattedDate = selectedDate;
  const slotsForDate = slots[formattedDate] || [];

  const { shopId, serviceId, service, offers } = route.params;

  const [experts, setExperts] = useState([]);

  useEffect(() => {
    if (route?.params?.shopId) {
      const fetchExperts = async () => {
        const expertUrl = `${BACKEND_URL}/api/v1/customer/experts/${route?.params?.shopId}`;

        try {
          setExpertsLoading(true);

          const response = await fetch(expertUrl, {
            method: 'GET',
          });

          const expertsData = await response.json();

          if (expertsData && expertsData?.experts?.length > 0) {
            setExperts(expertsData.experts);
          } else {
            setExperts([]);
          }
        } catch (err) {
          setExperts([]);
        } finally {
          setExpertsLoading(false);
        }
      };
      fetchExperts();
    }
  }, [route?.params?.shopId]);

  useEffect(() => {
    if (!route.params?.shopId) return;

    const fetchSlots = async () => {
      const slotsUrl = `${BACKEND_URL}/api/v1/customer/slots/${route?.params?.shopId}`;

      try {
        setLoading(true);

        const response = await fetch(slotsUrl, {
          method: 'GET',
        });

        const slotsData = await response.json();

        if (slotsData && slotsData?.slots?.length > 0) {
          const groupedSlots = slotsData.slots.reduce((acc, slot) => {
            const date = slot.slotDate;
            if (!acc[date]) {
              acc[date] = [];
            }
            acc[date].push(slot);
            return acc;
          }, {});

          setSlots(groupedSlots);
        } else {
          setSlots({});
        }
      } catch (err) {
        setSlots({});
      } finally {
        setLoading(false);
      }
    };
    fetchSlots();
  }, [route?.params?.shopId]);

  useEffect(() => {
    if (service) {
      const serviceWithQty = { ...service, qty: quantity };
      setSelectedServices([serviceWithQty]);
    }
  }, [service, quantity]);

  useEffect(() => {
    if (!selectedExpert && experts.length > 0) {
      setSelectedExpert(experts[0].id);
    }
  }, [experts]);

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
    const totalAmount = calculateTotal();
    const updatedServices = selectedServices?.map(service => ({
      ...service,
      qty: quantity,
      totalPrice: (service.rate || 0) * quantity,
    }));

    navigation.navigate('BookingSummaryScreen', {
      selectedDate: selectedDate,
      selectedTime: selectedTime,
      selectedServices: updatedServices,
      selectedExpert: experts.find(expert => expert.id === selectedExpert),
      shopId,
      offers: route.params.offers,
      selectedSlot,
      quantity: quantity,
      totalAmount: totalAmount,
    });
  };

  const incrementQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
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
    const hasAvailableSlots = slots[date].some(slot => {
      const booked = slot.bookedCount || 0;
      const capacity = slot.maxCapacity || 1;
      return slot.isAvailable && booked < capacity;
    });

    if (hasAvailableSlots) {
      markedDates[date] = {
        ...(markedDates[date] || {}),
        marked: true,
        dotColor: primaryColor,
      };
    } else {
      markedDates[date] = {
        ...(markedDates[date] || {}),
        marked: true,
        dotColor: lightPurple,
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
      'YYYY-MM-DD HH:mm:ss',
    );

    if (moment(selectedDate).isSame(now, 'day') && slotDateTime.isBefore(now)) {
      Alert.alert('Invalid Time', 'Please choose an upcoming time slot.');
      return;
    }

    setSelectedTime(slot);
    setSelectedSlot(slot);
  };

  const calculateTotal = () => {
    if (!selectedServices || selectedServices.length === 0) return 0;
    const rate = selectedServices[0]?.rate || 0;
    return rate * quantity;
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
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.mainTitle}>Book Appointment</Text>

          {errorMessage && (
            <View style={styles.errorMessageContainer}>
              <Ionicons name="alert-circle-outline" size={18} color="#FF4444" />
              <Text style={styles.errorMessageText}>{errorMessage}</Text>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Experts</Text>
            {expertsLoading && (
              <Text style={styles.loadingText}>Loading...</Text>
            )}

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {!loading && experts.length === 0 ? (
                <Text style={styles.noExpertsText}>No experts available</Text>
              ) : (
                experts.map(expert => (
                  <View key={expert.id} style={styles.expertItem}>
                    <TouchableOpacity
                      style={styles.expertCard}
                      onPress={() =>
                        setSelectedExpert(prev =>
                          prev === expert.id ? null : expert.id,
                        )
                      }
                    >
                      <View style={styles.avatarContainer}>
                        <Image
                          source={{
                            uri:
                              typeof expert.image === 'string'
                                ? expert.image
                                : NO_IMAGE,
                          }}
                          style={styles.avatar}
                        />
                        {selectedExpert === expert.id && (
                          <View style={styles.avatarOverlay}>
                            <Ionicons
                              name="checkmark-circle"
                              size={24}
                              color="#fff"
                            />
                          </View>
                        )}
                      </View>
                      <Text style={styles.expertName}>{expert.name ?? ''}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.viewDetailsButton}
                      onPress={() =>
                        navigation.navigate('BeautyExpertDetailsScreen', {
                          expertId: expert.id,
                        })
                      }
                    >
                      <Text style={styles.viewDetailsText}>Details</Text>
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </ScrollView>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quantity</Text>
            <View style={styles.quantityWrapper}>
              <View style={styles.quantityContainer}>
                <TouchableOpacity
                  style={[
                    styles.quantityButton,
                    quantity <= 1 && styles.quantityButtonDisabled,
                  ]}
                  onPress={decrementQuantity}
                  disabled={quantity <= 1}
                >
                  <Ionicons
                    name="remove"
                    size={20}
                    color={quantity <= 1 ? '#CCC' : '#D41172'}
                  />
                </TouchableOpacity>
                <Text style={styles.quantityText}>{quantity}</Text>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={incrementQuantity}
                >
                  <Ionicons name="add" size={20} color="#D41172" />
                </TouchableOpacity>
              </View>
              <View style={styles.priceSummary}>
                <Text style={styles.priceLabel}>Total Amount</Text>
                <Text style={styles.priceValue}>₹{calculateTotal()}</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Date</Text>
            <Calendar
              onDayPress={onDayPress}
              markedDates={markedDates}
              theme={{
                selectedDayBackgroundColor: primaryColor,
                selectedDayTextColor: '#ffffff',
                todayTextColor: primaryColor,
                arrowColor: primaryColor,
                textDayFontSize: 14,
                textMonthFontSize: 14,
                textDayHeaderFontSize: 12,
              }}
              minDate={moment().format('YYYY-MM-DD')}
              style={styles.calendar}
            />
            <View style={styles.legendRow}>
              <View
                style={[styles.legendDot, { backgroundColor: primaryColor }]}
              />
              <Text style={styles.legendText}>Available</Text>
              <View
                style={[
                  styles.legendDot,
                  { backgroundColor: lightPurple, marginLeft: 8 },
                ]}
              />
              <Text style={styles.legendText}>Booked</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Time Slots</Text>
            <View style={styles.timeSlotsContainer}>
              {slotsForDate.length === 0 ? (
                <Text style={styles.noSlotsText}>No slots available</Text>
              ) : (
                slotsForDate.map(slot => {
                  const startTimeFormatted = moment(
                    slot.startTime,
                    'HH:mm:ss',
                  ).format('h:mm A');
                  const endTimeFormatted = moment(
                    slot.endTime,
                    'HH:mm:ss',
                  ).format('h:mm A');
                  const booked = slot.bookedCount || 0;
                  const capacity = slot.maxCapacity || 1;
                  const isFull = booked >= capacity;
                  const isSelected = selectedTime?.id === slot.id;
                  const isDisabled = !slot.isAvailable || isFull;
                  const isPastTime =
                    moment(selectedDate).isSame(moment(), 'day') &&
                    moment(
                      `${selectedDate} ${slot.startTime}`,
                      'YYYY-MM-DD HH:mm:ss',
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
                        {startTimeFormatted}
                      </Text>
                      <Text
                        style={[
                          styles.capacityText,
                          isSelected && { color: '#fff' },
                        ]}
                      >
                        {isFull ? 'Full' : `${capacity - booked} left`}
                      </Text>
                    </TouchableOpacity>
                  );
                })
              )}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Services</Text>
            <View style={styles.table}>
              <View style={styles.tableRow}>
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
                  Qty
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
              {selectedServices?.map(service => (
                <View key={service.id} style={styles.tableRow}>
                  <Text style={[styles.tableCell, { flex: 2 }]}>
                    {service.name}
                  </Text>
                  <Text style={styles.tableCell}>{quantity}</Text>
                  <Text
                    style={[
                      styles.tableCell,
                      { textAlign: 'right', color: primaryColor },
                    ]}
                  >
                    ₹{(service?.rate || 0) * quantity}
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
    left: 15,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 4,
    fontWeight: '500',
  },
  container: {
    flex: 1,
    marginTop: 85,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#160B26',
    textAlign: 'center',
    marginBottom: 12,
  },
  errorMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0F7',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  errorMessageText: {
    color: '#D41172',
    fontSize: 12,
    marginLeft: 6,
    flex: 1,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#160B26',
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#D41172',
    paddingLeft: 8,
  },
  loadingText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 12,
    marginVertical: 4,
  },
  expertItem: {
    marginRight: 10,
    alignItems: 'center',
  },
  expertCard: {
    alignItems: 'center',
    padding: 6,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    width: 70,
  },
  avatarContainer: {
    width: 55,
    height: 55,
    borderRadius: 28,
    marginBottom: 4,
    backgroundColor: '#FFE0EF',
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
  },
  avatarOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(212, 17, 114, 0.7)',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  expertName: {
    fontSize: 11,
    fontWeight: '500',
    color: '#374151',
    textAlign: 'center',
  },
  noExpertsText: {
    color: '#999',
    fontSize: 12,
    textAlign: 'center',
    paddingVertical: 10,
  },
  viewDetailsButton: {
    marginTop: 3,
    paddingVertical: 2,
    paddingHorizontal: 6,
    backgroundColor: '#FFF0F7',
    borderRadius: 6,
  },
  viewDetailsText: {
    fontSize: 9,
    color: '#D41172',
    fontWeight: '500',
  },
  calendar: {
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: '#E2E8F0',
    paddingBottom: 5,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    justifyContent: 'flex-end',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 3,
  },
  legendText: {
    fontSize: 10,
    color: '#666',
    marginRight: 6,
  },
  timeSlotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  timeSlot: {
    backgroundColor: '#D41172',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 8,
    marginBottom: 6,
    width: '48%',
    alignItems: 'center',
  },
  timeSlotSelected: {
    backgroundColor: '#A80E5A',
  },
  timeSlotDisabled: {
    backgroundColor: '#FFE0EF',
    opacity: 0.6,
  },
  timeSlotText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 11,
  },
  timeSlotTextSelected: {
    color: '#fff',
  },
  timeSlotTextDisabled: {
    color: '#999',
  },
  capacityText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 9,
    marginTop: 2,
  },
  noSlotsText: {
    color: '#999',
    textAlign: 'center',
    paddingVertical: 15,
    fontSize: 12,
  },
  table: {
    borderWidth: 0.5,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F1F5F9',
  },
  tableCell: {
    flex: 1,
    fontSize: 12,
    color: '#6B7280',
  },
  tableHeaderText: {
    fontWeight: 'bold',
    color: '#160B26',
    fontSize: 11,
  },
  nextButton: {
    backgroundColor: '#D41172',
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 8,
  },
  disabledButton: {
    backgroundColor: '#CCC',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  quantityWrapper: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF0F7',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFD6E8',
  },
  quantityButtonDisabled: {
    backgroundColor: '#F5F5F5',
    borderColor: '#E5E5E5',
  },
  quantityText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#160B26',
    marginHorizontal: 30,
    minWidth: 40,
    textAlign: 'center',
  },
  priceSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  priceLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  priceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#D41172',
  },
});

export default BookingScreen;
