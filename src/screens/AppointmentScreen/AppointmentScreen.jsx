import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  StatusBar,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { GREY } from '../../constants/colors';

const primaryColor = '#D41172';

const servicesData = [
  {
    id: 1,
    title: 'Hair cut',
    types: '20 Types',
    image: require('../../assets/images/services/1.png'),
  },
  {
    id: 2,
    title: 'Facial',
    types: '20 Types',
    image: require('../../assets/images/services/2.png'),
  },
  {
    id: 3,
    title: 'hair Treatment',
    types: '15 Types',
    image: require('../../assets/images/services/3.png'),
  },
  {
    id: 4,
    title: 'Makeup',
    types: '10 Types',
    image: require('../../assets/images/services/4.png'),
  },
];

const AppointmentScreen = ({ route, navigation }) => {
  const [selectedType, setSelectedType] = useState('Child');

  const { shopId, serviceId } = route.params;

  return (
    <View style={styles.outerContainer}>
      <StatusBar backgroundColor={primaryColor} barStyle="light-content" />
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContentContainer}
        >
          <Text style={styles.mainTitle}>Appointment</Text>

          <Text style={styles.sectionTitle}>Customer Type</Text>
          <View style={styles.radioGroup}>
            {['Child', 'Women', 'Others'].map(type => (
              <TouchableOpacity
                key={type}
                style={styles.radioButton}
                onPress={() => setSelectedType(type)}
              >
                <View style={styles.radioOuterCircle}>
                  {selectedType === type && (
                    <View style={styles.radioInnerCircle} />
                  )}
                </View>
                <Text style={styles.radioLabel}>{type}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Select Services</Text>
          {servicesData.map(service => (
            <View key={service.id} style={styles.card}>
              <Image source={service.image} style={styles.cardImage} />
              <View style={styles.cardTextContainer}>
                <Text style={styles.cardTitle}>{service.title}</Text>
                <Text style={styles.cardSubtitle}>{service.types}</Text>
              </View>
              <TouchableOpacity style={styles.styleButton}>
                <Text style={styles.styleButtonText}>Styles</Text>
                <Ionicons name="caret-down" size={12} color={'grey'} />
              </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity
            style={styles.nextButton}
            onPress={() => navigation.navigate('BookingScreen')}
          >
            <Text style={styles.nextButtonText}>NEXT</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#D41172',
  },
  container: {
    flex: 1,
    marginTop: 60,
    backgroundColor: '#FFFBF6',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
  },
  scrollContentContainer: {
    padding: 25,
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: '600',
    color: '#160B26',
    textAlign: 'center',
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#160B26',
    marginBottom: 15,
  },
  radioGroup: {
    flexDirection: 'row',
    marginBottom: 30,
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 30,
  },
  radioOuterCircle: {
    height: 22,
    width: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#D41172',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  radioInnerCircle: {
    height: 12,
    width: 12,
    borderRadius: 6,
    backgroundColor: '#D41172',
  },
  radioLabel: {
    fontSize: 16,
    color: '#6B7280',
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    marginBottom: 15,
    overflow: 'hidden',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    padding: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  cardImage: {
    width: 70,
    height: 70,
    borderRadius: 12,
  },
  cardTextContainer: {
    flex: 1,
    paddingHorizontal: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  styleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0F7',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
  },
  styleButtonText: {
    color: '#D41172',
    fontWeight: '500',
    marginRight: 5,
  },
  nextButton: {
    backgroundColor: '#D41172',
    paddingVertical: 18,
    paddingHorizontal: 28,
    borderRadius: 50,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
    shadowColor: '#D41172',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 32,
    elevation: 8,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});

export default AppointmentScreen;
