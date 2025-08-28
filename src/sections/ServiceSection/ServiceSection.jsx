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
import { getOffersByShop, getServicesByShop } from '../../apis/services';
import { NO_IMAGE } from '../../constants/images';
import { useNavigation } from '@react-navigation/native';
import ServiceCardSkeleton from '../../components/ServiceCardSkeleton/ServiceCardSkeleton';
import EmptyComponent from '../../components/EmptyComponent/EmptyComponent';
import OfferText from '../../components/OfferText/OfferText';

const ServiceItem = ({ item, shopId }) => {
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
        onPress={() =>
          navigation.navigate('BookingScreen', {
            shopId: shopId,
            serviceId: item.id,
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

const OfferItem = ({ item, shopId }) => {
  const navigation = useNavigation();
  return (
    <View style={styles.card}>
      <Image
        source={{
          uri:
            typeof item.service.imageUrl === 'string'
              ? item.service.imageUrl
              : NO_IMAGE,
        }}
        style={styles.cardImage}
      />
      <View style={styles.cardTextContainer}>
        <Text style={styles.cardTitle}>{item.serviceName}</Text>

        <OfferText regularPrice={500} offerPrice={450} />
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

const ServiceSection = ({ shopId, navigation }) => {
  const [activeTab, setActiveTab] = useState('Services');
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [offers, setOffers] = useState([]);
  const [offersLoading, setOffersLoading] = useState(false);

  useEffect(() => {
    if (shopId) {
      const fetchServices = async () => {
        try {
          setLoading(true);
          const res = await getServicesByShop(shopId);
          setLoading(false);
          console.log('services:', services);
          if (res && res.length > 0) {
            setServices(res);
          }
        } catch (err) {
          console.error('Error fetching services:', err);
        } finally {
          setLoading(false);
        }
      };

      fetchServices();
    }
  }, [shopId, services]);

  useEffect(() => {
    if (shopId) {
      const fetchOffers = async () => {
        try {
          setOffersLoading(true);
          const res = await getOffersByShop(shopId);
          setOffersLoading(false);
          console.log('offers:', offers);
          if (res && res.length > 0) {
            setOffers(res);
          }
        } catch (err) {
          console.error('Error fetching offers:', err);
        } finally {
          setOffersLoading(false);
        }
      };

      fetchOffers();
    }
  }, [shopId, offers]);

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
          {loading ? (
            <>
              <ServiceCardSkeleton />
            </>
          ) : !loading && services.length == 0 ? (
            <>
              <EmptyComponent />
            </>
          ) : (
            <FlatList
              data={services}
              renderItem={({ item }) => (
                <ServiceItem item={item} shopId={shopId} />
              )}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.listContainer}
            />
          )}
        </>
      ) : (
        <>
          {offersLoading ? (
            <>
              <ServiceCardSkeleton />
            </>
          ) : !offersLoading && offers.length == 0 ? (
            <>
              <EmptyComponent />
            </>
          ) : (
            <FlatList
              data={offers}
              renderItem={({ item }) => (
                <OfferItem item={item} shopId={shopId} />
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
    // paddingHorizontal: 16,
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
