import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { primaryColor } from '../../constants/colors';

const DrawerItem = ({ icon, label, onPress }) => (
  <TouchableOpacity onPress={onPress} style={styles.drawerItem}>
    <View style={styles.iconContainer}>{icon}</View>
    <Text style={styles.drawerItemText}>{label}</Text>
  </TouchableOpacity>
);

const CustomDrawerContent = props => {
  return (
    <View style={styles.container}>
      <DrawerContentScrollView {...props}>
        <View style={styles.profileContainer}>
          <Image
            source={require('../../assets/images/users/1.png')}
            style={styles.avatar}
          />
          <View>
            <Text style={styles.userName}>Jesika Sabrina</Text>
            <Text style={styles.userPhone}>5936-685-214</Text>
          </View>
        </View>

        <View style={styles.drawerSection}>
          {/* <DrawerItem
            label="Add Payment Method"
            icon={
              <Ionicons name="card-outline" size={24} color={primaryColor} />
            }
            onPress={() => {}}
          /> */}
          <DrawerItem
            label="Change Password"
            icon={
              <Ionicons name="sync-outline" size={24} color={primaryColor} />
            }
            onPress={() => props.navigation.navigate('ChangePasswordScreen')}
          />
          <DrawerItem
            label="Help & Support"
            icon={
              <Ionicons
                name="help-buoy-outline"
                size={24}
                color={primaryColor}
              />
            }
            onPress={() => {
              props.navigation.navigate('HelpSupportScreen');
            }}
          />
          <DrawerItem
            label="Sign Out"
            icon={
              <MaterialCommunityIcons
                name="logout"
                size={24}
                color={primaryColor}
              />
            }
            onPress={() => {}}
          />
        </View>
      </DrawerContentScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: primaryColor,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    marginTop: 30,
    marginBottom: 20,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 15,
  },
  userName: {
    fontSize: 20,
    fontWeight: '400',
    color: '#fff',
  },
  userPhone: {
    fontSize: 16,
    color: '#E0E0E0',
    marginTop: 4,
  },
  drawerSection: {
    marginTop: 15,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  drawerItemText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '300',
  },
});

export default CustomDrawerContent;
