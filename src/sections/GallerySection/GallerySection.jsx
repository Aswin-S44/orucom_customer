import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { getGalleryImagesByShopId } from '../../apis/services';
import EmptyComponent from '../../components/EmptyComponent/EmptyComponent';
import { primaryColor } from '../../constants/colors';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');
const cardSize = (width - 24 * 2 - 16) / 2;

const GalleryItem = ({ item, onPress }) => {
  if (item.type === 'add') {
    return (
      <TouchableOpacity style={styles.card}>
        <Image source={item.image} style={styles.image} />
        <View style={styles.overlay}>
          <Text style={styles.plusIcon}>+</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(item.image)}>
      <Image source={{ uri: item.image }} style={styles.image} />
    </TouchableOpacity>
  );
};

const GallerySection = ({ shopId }) => {
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    if (shopId) {
      const fetchImages = async () => {
        try {
          setLoading(true);
          const res = await getGalleryImagesByShopId(shopId);
          if (res && res.length > 0) {
            setImages(res);
          }
        } catch (err) {
          console.error('Error fetching images:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchImages();
    }
  }, [shopId]);

  const handleImagePress = imageUrl => {
    setSelectedImage(imageUrl);
    setModalVisible(true);
  };

  return (
    <>
      {loading ? (
        <ActivityIndicator size="large" color={primaryColor} />
      ) : !loading && images.length === 0 ? (
        <EmptyComponent />
      ) : (
        <FlatList
          data={images}
          renderItem={({ item }) => (
            <GalleryItem item={item} onPress={handleImagePress} />
          )}
          keyExtractor={item => item.id}
          numColumns={2}
          contentContainerStyle={styles.container}
          columnWrapperStyle={styles.row}
        />
      )}

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Image
              source={{ uri: selectedImage }}
              style={styles.fullScreenImage}
              resizeMode="contain"
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Ionicons name="close" size={20} />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 0,
  },
  row: {
    justifyContent: 'space-between',
    flexDirection: 'column',
  },
  card: {
    width: '100%',
    height: cardSize,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: '#f0f0f0',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(142, 68, 173, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusIcon: {
    color: '#fff',
    fontSize: 60,
    fontWeight: '300',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.9)',
  },
  modalView: {
    width: '90%',
    height: '80%',
    backgroundColor: 'black',
    borderRadius: 10,
    overflow: 'hidden',
  },
  fullScreenImage: {
    width: '100%',
    height: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default GallerySection;
