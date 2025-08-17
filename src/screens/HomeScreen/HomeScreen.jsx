import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
} from 'react-native';
import React from 'react';

import EvilIcons from 'react-native-vector-icons/EvilIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Card from '../../components/Card/Card';
import { primaryColor, secondaryColor } from '../../constants/colors';

const HomeScreen = ({ navigation }) => {
  const services = [
    {
      id: 1,
      name: 'HairCare',
      icon: 'spa',
      image: require('../../assets/images/category/1.png'),
    },
    {
      id: 2,
      name: 'Makeover',
      icon: 'smile-o',
      image: require('../../assets/images/category/2.png'),
    },
    {
      id: 3,
      name: 'Skin Care',
      icon: 'female',
      image: require('../../assets/images/category/3.png'),
    },
    {
      id: 4,
      name: 'Facial',
      icon: 'scissors',
      image: require('../../assets/images/category/4.png'),
    },
  ];

  const featuredSection = [
    {
      id: 1,
      serviceName: 'Live Style Parlour',
      image: require('../../assets/images/bg.png'),
      location: 'Captown City',
      rating: 4.0,
      status: 'Open',
    },
    {
      id: 2,
      serviceName: 'Kigfisher Pro',
      image: require('../../assets/images/services/6.png'),
      location: 'Captown City',
      rating: 4.0,
      status: 'Open',
    },
    {
      id: 3,
      serviceName: 'Landon Town',
      image: require('../../assets/images/services/5.png'),
      location: 'Captown City',
      rating: 4.0,
      status: 'Open',
    },
    {
      id: 4,
      serviceName: 'Live Style Parlour',
      image: require('../../assets/images/services/4.png'),
      location: 'Captown City',
      rating: 4.0,
      status: 'Open',
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <StatusBar
        backgroundColor="transparent"
        translucent={true}
        barStyle="light-content"
      />

      <View style={styles.bannerContainer}>
        <Image
          source={require('../../../images/home_bg.png')}
          style={styles.bannerImage}
        />

        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.openDrawer()}
            style={styles.hamburgerIconContainer}
          >
            <View style={[styles.hamburgerLine, { width: 30 }]} />
            <View style={[styles.hamburgerLine, { width: 25 }]} />
            <View style={[styles.hamburgerLine, { width: 30 }]} />
          </TouchableOpacity>
          <View>
            <TouchableOpacity
              style={{
                backgroundColor: '#fff',
                width: 35,
                height: 35,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
              }}
            >
              <Ionicons
                name="notifications-outline"
                size={25}
                color={primaryColor}
              />
              <View style={styles.badgeContainer}>
                <Text style={styles.badgeText}>02</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bannerTextContainer}>
          <Text style={styles.bannerTitle}>Beauty Parlour</Text>
          <Text style={styles.bannerSubtitle}>Beauty Parlour Booking App</Text>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <TextInput
              placeholder="Spa, Facial, Makeup"
              style={styles.searchInput}
              placeholderTextColor="#888"
            />
            <EvilIcons
              name="search"
              size={32}
              color="#888"
              style={styles.searchIcon}
            />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.servicesContainer}>
            {services.map(service => (
              <View key={service.id}>
                <TouchableOpacity
                  style={styles.serviceCard}
                  onPress={() =>
                    navigation.navigate('Appointment', {
                      service: service.name,
                    })
                  }
                >
                  <Image source={service.image} style={styles.smallImage} />
                </TouchableOpacity>
                <Text style={styles.serviceName}>{service.name}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Popular Beauty Parlour</Text>
        <View style={styles.featuredContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {featuredSection.map((feature, index) => (
              <TouchableOpacity
                key={index}
                onPress={() =>
                  navigation.navigate('ParlourDetails', {
                    parlourData: feature,
                  })
                }
              >
                <Card
                  image={feature.image}
                  title={feature.serviceName}
                  location={feature.location}
                  rating={feature.rating}
                  status={feature.status}
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Popular Categories</Text>
        <View style={styles.featuredContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {featuredSection.map((feature, index) => (
              <View key={index}>
                <Card
                  image={feature.image}
                  title={feature.serviceName}
                  location={feature.location}
                  rating={feature.rating}
                  status={feature.status}
                />
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  bannerContainer: {
    position: 'relative',
    height: 280,
    marginBottom: 40,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  header: {
    position: 'absolute',
    top: 40,
    left: 15,
    right: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 1,
  },
  badgeContainer: {
    position: 'absolute',
    right: -6,
    top: -3,
    backgroundColor: primaryColor,
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  smallImage: {
    height: 30,
    width: 30,
  },
  bannerTextContainer: {
    position: 'absolute',
    top: 140,
    left: 23,
    right: 15,
  },
  bannerTitle: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '400',
  },
  bannerSubtitle: {
    color: '#fff',
    fontSize: 16,
  },
  searchContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    height: 50,
    width: '85%',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  section: {
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 500,
    marginBottom: 15,
    color: '#333',
    left: 10,
  },
  servicesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },

  serviceCard: {
    width: 72,
    alignItems: 'center',
    marginRight: 10,
    padding: 10,
    height: 72,
    backgroundColor: secondaryColor,
    borderRadius: 50,
    justifyContent: 'center',
  },

  serviceName: {
    marginTop: 8,
    fontSize: 14,
    textAlign: 'center',
    color: '#333',
    fontWeight: '500',
  },
  featuredContainer: {
    flexDirection: 'row',
  },
  hamburgerIconContainer: {
    padding: 5,
  },
  hamburgerLine: {
    height: 3,
    backgroundColor: '#fff',
    borderRadius: 2,
    marginVertical: 3,
  },
});

export default HomeScreen;
