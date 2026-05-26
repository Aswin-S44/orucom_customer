import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  Image,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { primaryColor, starColor } from '../../constants/colors';
import { formatText } from '../../utils/utils';
import { DEFAULT_AVATAR } from '../../constants/images';
import ProfileScreenSkeleton from '../../components/ProfileScreenSkeleton/ProfileScreenSkeleton';
import { BACKEND_URL } from '../../services/apis';

const StarRating = ({ rating, count }) => {
  const stars = [];
  const filledStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;

  for (let i = 0; i < filledStars; i++) {
    stars.push(
      <Ionicons
        key={`star-filled-${i}`}
        name="star"
        size={18}
        color={starColor}
      />,
    );
  }

  if (hasHalfStar) {
    stars.push(
      <Ionicons
        key="star-half"
        name="star-half-sharp"
        size={18}
        color={starColor}
      />,
    );
  }

  const emptyStars = 5 - stars.length;
  for (let i = 0; i < emptyStars; i++) {
    stars.push(
      <Ionicons
        key={`star-empty-${i}`}
        name="star-outline"
        size={18}
        color={starColor}
      />,
    );
  }

  return (
    <View style={styles.starRatingContainer}>
      {stars}
      <Text style={styles.ratingText}>
        {' '}
        {rating} ({count})
      </Text>
    </View>
  );
};

const BeautyExpertDetailsScreen = ({ navigation, route }) => {
  const { expertId } = route.params;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchExpertDetails = async () => {
      setLoading(true);
      const url = `${BACKEND_URL}/api/v1/customer/expert/${expertId}`;
      try {
        const response = await fetch(url, {
          method: 'GET',
        });

        const result = await response.json();
        if (result) {
          setData(result);
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    if (expertId) {
      fetchExpertDetails();
    }
  }, [expertId]);

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

      {loading ? (
        <ProfileScreenSkeleton />
      ) : (
        <View style={styles.container}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.mainTitle}>Beauty Expert</Text>

            <View style={styles.profileSection}>
              <Image
                source={{
                  uri: data?.expert?.image ?? DEFAULT_AVATAR,
                }}
                style={styles.avatar}
              />
              <Text style={styles.expertName}>{data?.expert?.name ?? '_'}</Text>
              <Text style={styles.expertSpecialty}>
                {formatText(data?.expert?.specialist ?? '')}
              </Text>
              <StarRating rating={data?.shop?.totalRating ?? 0} count={0} />
              <TouchableOpacity
                style={styles.bookButton}
                onPress={() =>
                  navigation.navigate('BookingScreen', {
                    shopId: data?.shop?.id,
                    selectedExpert: expertId,
                  })
                }
              >
                <Text style={styles.bookButtonText}>Book Now</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About</Text>
              <Text style={styles.descriptionText}>
                {data?.expert?.about ?? ''}
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Shop</Text>
              <Text style={styles.descriptionText}>
                {data?.shop?.parlourName ?? ''}
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Address</Text>
              <View style={styles.addressContainer}>
                <Ionicons
                  name="location-sharp"
                  size={24}
                  color={primaryColor}
                />
                <Text style={styles.addressText}>
                  {data?.shop?.address ?? '-'}
                </Text>
              </View>
            </View>
          </ScrollView>
        </View>
      )}
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
    fontSize: 28,
    fontWeight: '400',
    color: '#333',
    textAlign: 'center',
    marginTop: 25,
    marginBottom: 20,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 25,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
  },
  expertName: {
    fontSize: 22,
    fontWeight: '500',
    color: '#333',
  },
  expertSpecialty: {
    fontSize: 16,
    color: '#777',
    marginVertical: 4,
  },
  starRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  ratingText: {
    fontSize: 15,
    color: '#777',
  },
  bookButton: {
    backgroundColor: primaryColor,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 20,
    marginTop: 10,
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '500',
    color: '#333',
    marginBottom: 15,
  },
  descriptionText: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressText: {
    flex: 1,
    fontSize: 16,
    color: '#555',
    lineHeight: 24,
    marginHorizontal: 15,
  },
});

export default BeautyExpertDetailsScreen;
