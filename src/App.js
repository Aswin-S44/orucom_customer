import React, { useContext, useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Icon from 'react-native-vector-icons/FontAwesome';

import HomeScreen from './screens/HomeScreen/HomeScreen';
import ProfileScreen from './screens/ProfileScreen/ProfileScreen';
import AllAppointments from './screens/AllAppointments/AllAppointments';
import CustomDrawerContent from './components/CustomDrawerContent/CustomDrawerContent';
import ParlourDetails from './screens/ParlourDetails/ParlourDetails';
import BookingScreen from './screens/BookingScreen/BookingScreen';
import BookingSummaryScreen from './screens/BookingSummaryScreen/BookingSummaryScreen';
import AppointmentScreen from './screens/AppointmentScreen/AppointmentScreen';
import ChangePasswordScreen from './screens/ChangePasswordScreen/ChangePasswordScreen';
import HelpSupportScreen from './screens/HelpSupportScreen/HelpSupportScreen';
import NearByShopsList from './screens/NearByShopsList/NearByShopsList';
import BeautyExpertDetailsScreen from './screens/BeautyExpertDetailsScreen/BeautyExpertDetailsScreen';
import OTPVerificationScreen from './screens/OTPVerificationScreen/OTPVerificationScreen';
import SplashScreen from './screens/SplashScreen/SplashScreen';
import SignInScreen from './screens/SignInScreen/SignInScreen';
import SignUpScreen from './screens/SignUpScreen/SignUpScreen';
import SearchResultsScreen from './screens/SearchResultsScreen/SearchResultsScreen';
import EditProfileScreen from './screens/EditProfileScreen/EditProfileScreen';
import AllNotificationScreen from './screens/AllNotificationScreen/AllNotificationScreen';
import NofificationDetailsScreen from './screens/NofificationDetailsScreen/NofificationDetailsScreen';
import SigninWithGoogleScreen from './screens/SigninWithGoogleScreen/SigninWithGoogleScreen';
import AppointmentSummaryScreen from './screens/AppointmentSummaryScreen/AppointmentSummaryScreen';

import { primaryColor } from './constants/colors';
import { AuthContext } from './context/AuthContext';
import FirebaseNotificationService from './apis/FirebaseNotificationService';

const Tab = createMaterialBottomTabNavigator();
const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="ParlourDetails" component={ParlourDetails} />
      <Stack.Screen name="AppointmentScreen" component={AppointmentScreen} />
      <Stack.Screen name="BookingScreen" component={BookingScreen} />
      <Stack.Screen
        name="BookingSummaryScreen"
        component={BookingSummaryScreen}
      />
      <Stack.Screen
        name="BeautyExpertDetailsScreen"
        component={BeautyExpertDetailsScreen}
      />
      <Stack.Screen
        name="SearchResultsScreen"
        component={SearchResultsScreen}
      />
      <Stack.Screen
        name="AllNotificationScreen"
        component={AllNotificationScreen}
      />
      <Stack.Screen
        name="NotificationDetailsScreen"
        component={NofificationDetailsScreen}
      />
      <Stack.Screen
        name="AppointmentSummaryScreen"
        component={AppointmentSummaryScreen}
      />
    </Stack.Navigator>
  );
}

function ShopsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ShopsMain" component={NearByShopsList} />
      <Stack.Screen name="ParlourDetails" component={ParlourDetails} />
      <Stack.Screen name="BookingScreen" component={BookingScreen} />
      {/* Add any other screens reachable from Shops tab */}
    </Stack.Navigator>
  );
}

function AppointmentStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AllAppointments" component={AllAppointments} />
      <Stack.Screen
        name="AppointmentSummaryScreen"
        component={AppointmentSummaryScreen}
      />
    </Stack.Navigator>
  );
}

function TabNavigator() {
  return (
    <Tab.Navigator
      barStyle={{ backgroundColor: '#fff' }}
      activeColor={primaryColor}
      inactiveColor="#cccccc"
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="home" size={20} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Shops"
        component={ShopsStack}
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="location" size={20} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Appointment"
        component={AppointmentStack}
        options={{
          tabBarIcon: ({ color }) => (
            <Icon name="calendar" size={20} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="person-circle-outline" size={20} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function AppDrawer() {
  return (
    <Drawer.Navigator
      drawerContent={props => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen
        name="Main"
        component={TabNavigator}
        options={{ headerShown: false }}
      />
    </Drawer.Navigator>
  );
}

function MainAppStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AppDrawer" component={AppDrawer} />
      <Stack.Screen
        name="ChangePasswordScreen"
        component={ChangePasswordScreen}
      />
      <Stack.Screen name="HelpSupportScreen" component={HelpSupportScreen} />
      <Stack.Screen name="EditProfileScreen" component={EditProfileScreen} />
    </Stack.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="SigninWithGoogleScreen"
        component={SigninWithGoogleScreen}
      />
      <Stack.Screen name="SignIn" component={SignInScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen
        name="OTPVerificationScreen"
        component={OTPVerificationScreen}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  const { userData, loading } = useContext(AuthContext);

  useEffect(() => {
    const initializeNotifications = async () => {
      // if (!notificationSetupComplete) {
      try {
        FirebaseNotificationService.setupNotificationHandlers();
        // FirebaseNotificationService.listenForTokenRefresh();
        const hasPermission =
          await FirebaseNotificationService.requestNotificationPermission();
        console.log('userData------------', userData);
        if (hasPermission && userData) {
          await FirebaseNotificationService.getFCMToken(userData?.id);
        }
        // setNotificationSetupComplete(true);
      } catch (error) {
        console.error('App initialization error:', error);
      }
      // }
    };
    if (!loading) {
      initializeNotifications();
    }
  }, [loading, userData]);

  // ✅ Track whether the splash video has finished playing
  const [videoFinished, setVideoFinished] = useState(false);

  // ✅ Show splash as long as auth is loading OR video hasn't finished
  if (loading || !videoFinished) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SplashScreen onVideoEnd={() => setVideoFinished(true)} />
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {userData ? (
            <Stack.Screen name="MainAppStack" component={MainAppStack} />
          ) : (
            <Stack.Screen name="AuthStack" component={AuthStack} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
