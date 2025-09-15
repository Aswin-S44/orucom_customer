import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  StatusBar,
  Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { bookedColor, lightPurple, primaryColor } from '../../constants/colors';
import { getExpertsByShopId, getServiceById } from '../../apis/services';
import BookingScreenSkeleton from '../../components/BookingScreenSkeleton/BookingScreenSkeleton';
import { NO_IMAGE } from '../../constants/images';
import firestore from '@react-native-firebase/firestore';
import moment from 'moment';
import { AuthContext } from '../../context/AuthContext';

const timeSlots = [
  '8:00 am',
  '9:00 am',
  '10:00 am',
  '11:00 am',
  '12:00 pm',
  '1:00 pm',
  '2:00 pm',
  '3:00 pm',
  '4:00 pm',
  '5:00 pm',
  '6:00 pm',
  '7:00 pm',
  '8:00 pm',
  '9:00 pm',
];

const bookedSlots = ['10:00 am', '4:00 pm', '6:00 pm'];

const BookingScreen = ({ route, navigation }) => {
  const { user, userData } = useContext(AuthContext);
  const [selectedExpert, setSelectedExpert] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedServices, setSelectedServices] = useState(null);
  // const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [experts, setExperts] = useState([]);
  const [slots, setSlots] = useState({});

  // const [selectedDate, setSelectedDate] = useState(
  //   moment().format('YYYY-MM-DD'),
  // );

  const [selectedDate, setSelectedDate] = useState(new Date());

  const formattedDate = moment(selectedDate).format('YYYY-MM-DD');
  const slotsForDate = slots[formattedDate] || [];

  // const onDayPress = day => {
  //   setSelectedDate(day.dateString);
  // };

  const { shopId, serviceId } = route.params;

  useEffect(() => {
    if (!route.params?.shopId) return;

    setLoading(true);

    // React Native Firebase realtime listener
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
    if (shopId) {
      const fetchShopExperts = async () => {
        try {
          setLoading(true);
          const res = await getExpertsByShopId(shopId);
          setLoading(false);

          setExperts(res);
        } catch (error) {
          console.log('Error while fetching experts : ', error);
        }
      };
      fetchShopExperts();
    }
  }, [shopId]);

  useEffect(() => {
    if (shopId && serviceId) {
      const fetchServiceDetails = async () => {
        try {
          const res = await getServiceById(shopId, serviceId);
          if (res) {
            setSelectedServices([res]);
          }
        } catch (error) {
          console.error('Error fetching service details:', error);
        }
      };
      fetchServiceDetails();
    }
  }, [shopId, serviceId]);

  // const onDateChange = selectedDate => {
  //   const currentDate = selectedDate || selectedDate;
  //   setShowDatePicker(Platform.OS === 'ios');
  //   //setSelectedDate(new Date(currentDate));
  //   setSelectedDate(selectedDate.toDateString);
  // };

  const onDateChange = (event, date) => {
    if (date) {
      setSelectedDate(date);
    }
    setShowDatePicker(false);
  };

  const handleNext = () => {
    navigation.navigate('BookingSummaryScreen', {
      selectedDate: selectedDate.toDateString(),
      selectedTime: selectedTime,
      selectedServices: selectedServices,
      selectedExpert: experts.find(expert => expert.id === selectedExpert),
      shopId,
    });
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (loading) {
    return <BookingScreenSkeleton />;
  }

  return (
    <View style={styles.outerContainer}>
      <StatusBar backgroundColor={primaryColor} barStyle="light-content" />
      {console.log('selectedDate------------', selectedDate)}
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

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Choose Your Beauty Expert</Text>
            <View style={styles.navIcons}>
              <Ionicons name="chevron-back" size={20} color="#888" />
              <Ionicons name="chevron-forward" size={20} color="#333" />
            </View>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.expertScroll}
          >
            {experts.map(expert => (
              <View>
                <TouchableOpacity
                  key={expert.id}
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
                  key={expert.id}
                  style={styles.expertCard}
                  onPress={() => {
                    navigation.navigate('BeautyExpertDetailsScreen', {
                      expertId: expert.id,
                    });
                  }}
                >
                  {' '}
                  <Ionicons name="eye" size={18} color="#111" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>

          <Text style={styles.sectionTitle}>Select Date</Text>
          {/* <TouchableOpacity
            style={styles.datePicker}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateText}>{selectedDate.toDateString}</Text>
            {console.log(
              'selectedDate----------',
              selectedDate ? selectedDate : 'no selectedDate',
            )}
            <Ionicons name="calendar-outline" size={22} color="#888" />
          </TouchableOpacity> */}

          <TouchableOpacity
            style={styles.datePicker}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateText}>
              {selectedDate ? selectedDate.toDateString() : 'Select Date'}
            </Text>
            <Ionicons name="calendar-outline" size={22} color="#888" />
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              testID="datePicker"
              value={selectedDate}
              mode="date"
              display="default"
              onChange={onDateChange}
              minimumDate={today}
              accentColor="#FF69B4"
            />
          )}

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
                console.log('selectedTime-----------', selectedTime);
                const slotLabel = `${slot.startTime} - ${slot.endTime}`;
                const isSelected = selectedTime?.id === slot.id;
                // const isSelected = false;
                const isDisabled = !slot.isAvailable;

                return (
                  <TouchableOpacity
                    key={slot.id}
                    onPress={() => !isDisabled && setSelectedTime(slot)}
                    disabled={isDisabled}
                    style={[
                      styles.timeSlot,
                      isSelected && styles.timeSlotSelected,
                      isDisabled && { backgroundColor: '#d8b4fe' }, // light purple
                    ]}
                  >
                    <Text
                      style={[
                        styles.timeSlotText,
                        isSelected && styles.timeSlotTextSelected,
                        isDisabled && { color: '#aaa' }, // grey text for disabled
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
        {console.log('selectedExpert--------------', selectedExpert)}
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
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 35,
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
  datePicker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 15,
    marginBottom: 25,
  },
  dateText: {
    fontSize: 16,
    color: '#555',
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
    // width: '23%',
    backgroundColor: lightPurple,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'left',
    marginBottom: 10,
    whiteSpace: 'nowrap',
    width: '30%',
  },
  timeSlotSelected: {
    backgroundColor: primaryColor,
  },
  timeSlotBooked: {
    backgroundColor: bookedColor,
  },
  timeSlotText: {
    color: primaryColor,
    fontWeight: '600',
    left: 10,
    whiteSpace: 'nowrap',
    fontSize: 12,
  },
  timeSlotTextSelected: {
    color: '#fff',
  },
  timeSlotTextBooked: {
    color: '#999',
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
