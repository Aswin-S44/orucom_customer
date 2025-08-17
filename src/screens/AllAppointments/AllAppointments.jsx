import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  FlatList,
  Image,
} from 'react-native';

const primaryColor = '#8E44AD';

const historyData = [
  {
    id: '1',
    name: 'Sofiyan Lit',
    specialty: 'Spa Specialist',
    description: '25 Dec 2020,\n08:00pm\nAmount $250',
    status: 'Pending',
    image: require('../../assets/images/users/1.png'),
  },
  {
    id: '2',
    name: 'Nadiya Khan',
    specialty: 'Hair Specialist',
    description: '27 Dec 2020,\n10:00pm\nAmount $350',
    status: 'Completed',
    image: require('../../assets/images/users/2.png'),
  },
  {
    id: '3',
    name: 'Kusino Zaal',
    specialty: 'Skin Specialist',
    description: '10 Nov 2020,\n08:00pm\nAmount $170',
    status: 'Confirmed',
    image: require('../../assets/images/users/3.png'),
  },
  {
    id: '4',
    name: 'Lifa Mitali',
    specialty: 'Cut Specialist',
    description: '07 Nov 2020,\n09:00pm\nAmount $250',
    status: 'Canceled',
    image: require('../../assets/images/users/4.png'),
  },
];

const getStatusStyles = status => {
  switch (status) {
    case 'Pending':
      return {
        container: { backgroundColor: '#F3E5F5' },
        text: { color: '#8E44AD' },
      };
    case 'Completed':
      return {
        container: { backgroundColor: '#E1BEE7' },
        text: { color: '#6A1B9A' },
      };
    case 'Confirmed':
      return {
        container: { backgroundColor: '#9C27B0' },
        text: { color: '#FFFFFF' },
      };
    case 'Canceled':
      return {
        container: { backgroundColor: '#F1F1F1' },
        text: { color: '#9E9E9E' },
      };
    default:
      return {};
  }
};

const HistoryItem = ({ item }) => {
  const statusStyles = getStatusStyles(item.status);

  return (
    <View style={styles.itemContainer}>
      <View style={styles.expertColumn}>
        <Image source={item.image} style={styles.avatar} />
        <View>
          <Text style={styles.expertName}>{item.name}</Text>
          <Text style={styles.expertSpecialty}>{item.specialty}</Text>
        </View>
      </View>
      <View style={styles.descriptionColumn}>
        <Text style={styles.descriptionText}>{item.description}</Text>
      </View>
      <View style={styles.statusColumn}>
        <View style={[styles.statusBadge, statusStyles.container]}>
          <Text style={[styles.statusText, statusStyles.text]}>
            {item.status}
          </Text>
        </View>
      </View>
    </View>
  );
};

const AllAppointments = () => {
  return (
    <View style={styles.outerContainer}>
      <StatusBar backgroundColor={primaryColor} barStyle="light-content" />
      <View style={styles.container}>
        <Text style={styles.mainTitle}>Appointment History</Text>
        <View style={styles.headerRow}>
          <Text style={[styles.headerText, { flex: 1.5 }]}>Beauty Expert</Text>
          <Text style={[styles.headerText, { flex: 1.2 }]}>Description</Text>
          <Text style={[styles.headerText, { flex: 0.8, textAlign: 'right' }]}>
            Status
          </Text>
        </View>
        <FlatList
          data={historyData}
          renderItem={({ item }) => <HistoryItem item={item} />}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: primaryColor,
  },
  container: {
    flex: 1,
    marginTop: 80,
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
    marginVertical: 25,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  headerText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111',
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
  },
  expertColumn: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    marginRight: 10,
  },
  expertName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  expertSpecialty: {
    fontSize: 13,
    color: '#777',
  },
  descriptionColumn: {
    flex: 1.2,
  },
  descriptionText: {
    fontSize: 12,
    color: '#555',
    lineHeight: 20,
  },
  statusColumn: {
    flex: 0.8,
    alignItems: 'flex-end',
  },
  statusBadge: {
    borderRadius: 15,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '500',
  },
  separator: {
    height: 1,
    backgroundColor: '#F0F0F0',
  },
});

export default AllAppointments;
