import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
} from 'react-native';
import { GREY } from '../../constants/colors';
import { NO_IMAGE } from '../../constants/images';
import { useNavigation } from '@react-navigation/native';
import ServiceCardSkeleton from '../../components/ServiceCardSkeleton/ServiceCardSkeleton';
import EmptyComponent from '../../components/EmptyComponent/EmptyComponent';
import OfferText from '../../components/OfferText/OfferText';

const ServiceItem = ({ item, shopId, experts, offers }) => {
  const navigation = useNavigation();

  return (
    <View style={styles.card}>
      <Image
        source={{
          uri: typeof item.imageUrl === 'string' ? item.imageUrl : NO_IMAGE,
        }}
        style={styles.cardImage}
      />
      <View style={styles.cardTextContainer}>
        <Text style={styles.cardTitle}>{item.serviceName}</Text>
        <Text style={styles.cardSubtitle}>{item.category}</Text>
      </View>
      <TouchableOpacity
        style={[
          styles.bookButton,
          item.active ? styles.activeButton : styles.inactiveButton,
        ]}
        onPress={
          () =>
            navigation.navigate('BookingScreen', {
              shopId: shopId,
              serviceId: item.id,
              experts,
              service: item,
              offers,
            })
        
        }
      >
        <Text
          style={[
            styles.bookButtonText,
            item.active ? styles.activeButtonText : styles.inactiveButtonText,
          ]}
        >
          Book
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const OfferItem = ({ item, shopId, experts, offers }) => {
  const navigation = useNavigation();
 
  return (
    <View style={styles.card}>
      <Image
        source={{
          uri:
            item.imageUrl && item.imageUrl.trim() !== ''
              ? item.imageUrl
              : NO_IMAGE,
        }}
        style={styles.cardImage}
      />

      <View style={styles.cardTextContainer}>
        <Text style={styles.cardTitle}>{item.serviceName}</Text>
       
        <OfferText
          regularPrice={item?.regularPrice ?? 0}
          offerPrice={item?.offerPrice ?? 0}
        />
      </View>
      <TouchableOpacity
        style={[
          styles.bookButton,
          item.active ? styles.activeButton : styles.inactiveButton,
        ]}
        onPress={() =>
          navigation.navigate('BookingScreen', {
            shopId: shopId,
            serviceId: item.serviceId,
            experts,
            service: item,
            offers,
          })
        }
      >
        <Text
          style={[
            styles.bookButtonText,
            item.active ? styles.activeButtonText : styles.inactiveButtonText,
          ]}
        >
          Book
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const ServiceSection = ({
  shopId,
  initialServices,
  initialOffers,
  loadingServices,
  loadingOffers,
  experts,
}) => {
  const [activeTab, setActiveTab] = useState('Services');

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        <TouchableOpacity onPress={() => setActiveTab('Services')}>
          <Text
            style={[
              styles.tabText,
              activeTab === 'Services' && styles.activeTabText,
            ]}
          >
            Services
          </Text>
          {activeTab === 'Services' && <View style={styles.activeTabLine} />}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('Offers')}>
          <Text
            style={[
              styles.tabText,
              activeTab === 'Offers' && styles.activeTabText,
            ]}
          >
            Offers
          </Text>
          {activeTab === 'Offers' && <View style={styles.activeTabLine} />}
        </TouchableOpacity>
      </View>

      {activeTab === 'Services' ? (
        <>
          {loadingServices ? (
            <>
              <ServiceCardSkeleton />
            </>
          ) : initialServices.length === 0 ? (
            <>
              <EmptyComponent />
            </>
          ) : (
            <FlatList
              data={initialServices}
              renderItem={({ item }) => (
                <ServiceItem
                  item={item}
                  shopId={shopId}
                  experts={experts}
                  offers={initialOffers}
                />
              )}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.listContainer}
            />
          )}
        </>
      ) : (
        <>
          {loadingOffers ? (
            <>
              <ServiceCardSkeleton />
            </>
          ) : initialOffers.length === 0 ? (
            <>
              <EmptyComponent />
            </>
          ) : (
            <FlatList
              data={initialOffers}
              renderItem={({ item }) => (
                <OfferItem
                  item={item}
                  shopId={shopId}
                  experts={experts}
                  offers={initialOffers}
                />
              )}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.listContainer}
            />
          )}
        </>
      )}
    </View>
  );
};

const primaryColor = '#8E44AD';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  tabText: {
    fontSize: 18,
    color: '#A0A0A0',
    marginHorizontal: 20,
    fontWeight: '500',
  },
  activeTabText: {
    color: primaryColor,
    fontWeight: '600',
  },
  activeTabLine: {
    height: 2,
    backgroundColor: primaryColor,
    width: '60%',
    alignSelf: 'center',
    marginTop: 8,
  },
  listContainer: {
    paddingTop: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GREY,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardImage: {
    width: 65,
    height: 65,
    borderRadius: 8,
  },
  cardTextContainer: {
    flex: 1,
    marginLeft: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  bookButton: {
    paddingVertical: 8,
    paddingHorizontal: 22,
    borderRadius: 20,
  },
  activeButton: {
    backgroundColor: primaryColor,
  },
  inactiveButton: {
    backgroundColor: '#F3E5F5',
  },
  bookButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  activeButtonText: {
    color: '#fff',
  },
  inactiveButtonText: {
    color: primaryColor,
  },
  offersContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ServiceSection;
