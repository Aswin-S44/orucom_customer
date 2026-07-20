import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Reviews from '../../components/Reviews/Reviews';
import { primaryColor } from '../../constants/colors';
import ServiceSection from '../../sections/ServiceSection/ServiceSection';
import GallerySection from '../../sections/GallerySection/GallerySection';
import { NO_IMAGE } from '../../constants/images';
import StarRating from '../../components/StarRating/StarRating';
import AboutSection from '../../sections/AboutSection/AboutSection';
import { updateShopViewers } from '../../apis/services';
import { BACKEND_URL } from '../../services/apis';

const ParlourDetails = ({ route, navigation }) => {
  const routeParlourData = route.params?.parlourData || null;

  const shopId =
    routeParlourData?.id || routeParlourData?._id || routeParlourData?.uid;

  const [activeTab, setActiveTab] = useState('Service');
  const [parlourData, setParlourData] = useState(routeParlourData);
  const [services, setServices] = useState([]);
  const [offers, setOffers] = useState([]);
  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchShopData = useCallback(async () => {
    if (!shopId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${BACKEND_URL}/api/v1/customer/shop/${shopId}`);
      const data = await res.json();

      if (data?.shop) {
        setParlourData(prev => ({
          ...prev,
          ...data.shop,
          totalRating: prev?.totalRating ?? data.shop?.totalRating ?? 0,
        }));
        setServices(data.services || []);
        setOffers(data.offers || []);
        setExperts(data.shop.experts || []);
      }
    } catch (err) {
      console.error('Error fetching shop details:', err);
    } finally {
      setLoading(false);
    }
  }, [shopId]);

  useEffect(() => {
    fetchShopData();
    if (shopId) {
      updateShopViewers(shopId);
    }
  }, [fetchShopData, shopId]);

  if (loading && !parlourData) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={primaryColor} />
      </View>
    );
  }

  if (!parlourData) {
    return (
      <View style={styles.loaderContainer}>
        <Text>Failed to load shop details.</Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ marginTop: 20 }}
        >
          <Text style={{ color: primaryColor }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const displayImage =
    parlourData?.shopImage || parlourData?.profileImage || NO_IMAGE;

  const renderTabContent = () => {
    switch (activeTab) {
      case 'About':
        return (
          <AboutSection
            about={parlourData?.about ?? ''}
            experts={experts}
            phone={parlourData?.phone ?? ''}
            email={parlourData?.email ?? ''}
            googleReviewUrl={parlourData?.googleReviewUrl ?? ''}
            address={parlourData?.address ?? ''}
          />
        );
      case 'Service':
        return (
          <View style={styles.content}>
            <ServiceSection
              shopId={shopId}
              initialServices={services}
              initialOffers={offers}
              loadingServices={false}
              loadingOffers={false}
              experts={experts}
            />
          </View>
        );
      case 'Gallery':
        return (
          <View style={styles.content}>
            <GallerySection shopId={shopId} placeId={parlourData?.placeId} />
          </View>
        );
      case 'Review':
        return (
          <View style={styles.content}>
            <Reviews placeId={parlourData?.placeId ?? null} />
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />
      <View style={styles.imageContainer}>
        <Image
          source={{
            uri: typeof displayImage === 'string' ? displayImage : NO_IMAGE,
          }}
          style={styles.image}
        />
        <View style={styles.overlay} />
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#fff" />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>{parlourData?.parlourName ?? ''}</Text>
            <Text style={styles.locationText}>
              {parlourData?.address ?? ''}
            </Text>
            <View style={styles.ratingContainer}>
              <StarRating rating={parlourData?.totalRating ?? 0} />
            </View>
          </View>
        </View>
      </View>

      <View style={styles.tabContainer}>
        {['Service', 'About', 'Gallery', 'Review'].map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {renderTabContent()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFBF6' },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFBF6',
  },
  imageContainer: {
    height: 300,
    position: 'relative',
    justifyContent: 'flex-end',
  },
  image: { width: '100%', height: '100%' },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 15,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 18,
    marginLeft: 5,
    fontWeight: '500',
  },
  headerContent: {
    padding: 20,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  headerLeft: { flex: 1 },
  title: { fontSize: 26, color: '#fff', marginBottom: 4, fontWeight: '700' },
  locationText: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 8,
  },
  ratingContainer: { flexDirection: 'row', alignItems: 'center' },
  tabContainer: { flexDirection: 'row', backgroundColor: '#0D0618' },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTab: { borderBottomColor: '#D41172' },
  tabText: { fontSize: 14, fontWeight: '500', color: 'rgba(255,255,255,0.5)' },
  activeTabText: { fontWeight: '700', color: '#fff' },
  content: { flex: 1 },
});

export default ParlourDetails;
