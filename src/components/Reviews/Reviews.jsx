import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, FlatList } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { primaryColor, starColor } from '../../constants/colors';
import { getReviews } from '../../apis/services';
import { DEFAULT_AVATAR } from '../../constants/images';
import ServiceCardSkeleton from '../ServiceCardSkeleton/ServiceCardSkeleton';
import EmptyComponent from '../EmptyComponent/EmptyComponent';

const reviewsData = [
  {
    id: '1',
    name: 'Jonson Wiliam',
    time: '1 day ago',
    rating: 4.5,
    comment:
      'Contrary to popular besimp and world class lyrandom text. It has roots',
    image: require('../../assets/images/user.png'),
  },
  {
    id: '2',
    name: 'Shikha Das',
    time: '3 month ago',
    rating: 4,
    comment:
      'Contrary to popular besimp and world class lyrandom text. It has roots',
    image: require('../../assets/images/user.png'),
  },
  {
    id: '3',
    name: 'Fiza Kubila',
    time: '2 month ago',
    rating: 3,
    comment:
      'Contrary to popular besimp and world class lyrandom text. It has roots',
    image: require('../../assets/images/user.png'),
  },
];

const StarRating = ({ rating, size = 16 }) => {
  const stars = [];
  const filledStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;

  for (let i = 0; i < filledStars; i++) {
    stars.push(
      <Ionicons
        key={`star-filled-${i}`}
        name="star"
        size={size}
        color={starColor}
      />,
    );
  }

  if (hasHalfStar) {
    stars.push(
      <Ionicons
        key="star-half"
        name="star-half-sharp"
        size={size}
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
        size={size}
        color="#D3D3D3"
      />,
    );
  }

  return <View style={styles.starContainer}>{stars}</View>;
};

const ProgressBar = ({ label, percentage }) => (
  <View style={styles.progressContainer}>
    <Text style={styles.progressLabel}>{label}</Text>
    <View style={styles.progressBarBackground}>
      <View style={[styles.progressBarFill, { width: `${percentage}%` }]} />
    </View>
  </View>
);

const ReviewItem = ({ item }) => (
  <View style={styles.reviewItemContainer}>
    <Image
      source={{
        uri:
          typeof item?.profile_photo_url === 'string'
            ? item.profile_photo_url
            : DEFAULT_AVATAR,
      }}
      style={styles.avatar}
    />
    {/* profile_photo_url */}
    <View style={styles.reviewContent}>
      <View style={styles.reviewHeader}>
        <Text style={styles.reviewerName}>{item?.author_name ?? '-'}</Text>
      </View>
      <View style={styles.ratingRow}>
        <Text style={styles.reviewTime}>
          {item?.relative_time_description ?? 'unavailable'}
        </Text>
        <StarRating rating={item.rating} />
      </View>
      <Text style={styles.reviewComment}>{item?.text ?? ''}</Text>
    </View>
  </View>
);

const Reviews = ({ placeId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [avgRating, setAvgRating] = useState(0);

  useEffect(() => {
    if (placeId) {
      const fetchReviews = async () => {
        try {
          setLoading(true);
          const res = await getReviews(placeId);

          if (res && res.rating && res.reviews) {
            setAvgRating(res.rating);
            setReviews(res.reviews);
          }
        } catch (error) {
          console.log('Error while fetching reviews : ', error);
          setError(error);
        } finally {
          setLoading(false);
        }
      };
      fetchReviews();
    }
  }, [placeId]);

  return (
    <View style={styles.container}>
      {loading ? (
        <ServiceCardSkeleton />
      ) : !loading && reviews.length == 0 ? (
        <EmptyComponent />
      ) : (
        <>
          <FlatList
            data={reviews}
            renderItem={({ item }) => <ReviewItem item={item} />}
            keyExtractor={item => item.id}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
          <View style={styles.overallRatingContainer}>
            <View style={styles.overallHeader}>
              <Text style={styles.overallRatingNumber}>{avgRating}</Text>
              <View>
                <Text style={styles.overallRatingTitle}>Overall Rating</Text>
                <View style={styles.overallStarsRow}>
                  <StarRating rating={avgRating} size={18} />
                  <Text style={styles.reviewCountText}>({reviews.length})</Text>
                </View>
              </View>
            </View>
            <View style={styles.progressSection}>
              <ProgressBar label="Service" percentage={90} />
              <ProgressBar label="Price" percentage={75} />
            </View>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 20,
  },
  reviewItemContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  reviewContent: {
    flex: 1,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  reviewTime: {
    fontSize: 13,
    color: '#888',
    marginRight: 10,
  },
  starContainer: {
    flexDirection: 'row',
  },
  reviewComment: {
    fontSize: 15,
    color: '#555',
    marginTop: 6,
    lineHeight: 22,
  },
  separator: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 16,
  },
  overallRatingContainer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  overallHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  overallRatingNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 15,
  },
  overallRatingTitle: {
    fontSize: 18,
    color: '#333',
    fontWeight: '500',
  },
  overallStarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  reviewCountText: {
    fontSize: 14,
    color: '#888',
    marginLeft: 8,
  },
  progressSection: {
    marginTop: 20,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressLabel: {
    fontSize: 16,
    color: '#555',
    width: 70,
  },
  progressBarBackground: {
    flex: 1,
    height: 8,
    backgroundColor: '#EAEAEA',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: primaryColor,
    borderRadius: 4,
  },
});

export default Reviews;
