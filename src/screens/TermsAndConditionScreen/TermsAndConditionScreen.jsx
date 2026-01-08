import React from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { primaryColor } from '../../constants/colors';

const BulletPoint = ({ text }) => (
  <View style={styles.bulletContainer}>
    <View style={styles.bullet} />
    <Text style={styles.bulletText}>{text}</Text>
  </View>
);

const TermsAndConditionScreen = () => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        style={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.mainTitle}>Terms and Conditions</Text>

        <View style={styles.headerInfo}>
          <Text style={styles.headerText}>
            <Text style={styles.bold}>Last Updated:</Text> December 25, 2025
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Introduction</Text>
          <Text style={styles.paragraph}>
            Welcome to Glamio, a product owned and operated by Nomino
            Innovations Private Limited. By accessing or using our mobile
            application or website, you agree to be bound by these terms. If you
            do not agree, please do not use our services.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            2. Scope of Service (Intermediary Status)
          </Text>
          <Text style={styles.paragraph}>
            Nomino Innovations Private Limited (via the Glamio app) acts solely
            as a technology platform connecting customers with independent
            beauty parlours and salons ("Service Providers").
          </Text>
          <BulletPoint text="We do not own, operate, or control the salons listed on Glamio." />
          <BulletPoint text="We do not provide beauty or grooming services directly." />
          <BulletPoint text="We are not responsible for the quality, hygiene, safety, or standard of the services provided by the Service Providers." />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            3. For Customers (Booking Rules)
          </Text>
          <BulletPoint text="Booking Confirmation: A booking is confirmed only when you receive a notification via the Glamio app or WhatsApp." />
          <BulletPoint text="Payments: Unless prepaid via the app, all payments must be made directly to the Salon after the service. Prices displayed on Glamio are estimates provided by the Salon." />
          <BulletPoint text="Cancellations: You agree to cancel appointments via the app at least 1 hour in advance to respect the Salon's time. Repeated 'No-Shows' without cancellation may result in your Glamio account being suspended." />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            4. For Salon Owners (Business Partners)
          </Text>
          <BulletPoint text="Accuracy: You are responsible for keeping your service menu, pricing, and availability up to date on Glamio. Nomino Innovations Private Limited is not liable for operational issues caused by outdated information." />
          <BulletPoint text="Service Fulfillment: You agree to honor all bookings confirmed through Glamio. Unjustified refusal of confirmed bookings may lead to delisting from the platform." />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Limitation of Liability</Text>
          <Text style={styles.paragraph}>
            To the fullest extent permitted by law:
          </Text>
          <BulletPoint text="Glamio and Nomino Innovations Private Limited are provided on an 'AS IS' basis. We do not guarantee that the app will be uninterrupted or error-free." />
          <BulletPoint text="The Company is not liable for any disputes, injuries, or damages arising between the Customer and the Salon." />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Governing Law</Text>
          <Text style={styles.paragraph}>
            These terms are governed by the laws of India. Any disputes are
            subject to the exclusive jurisdiction of the courts in Kerala.
          </Text>
        </View>

        <View style={{ height: 50 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 30,
    marginBottom: 10,
    color: '#333',
  },
  headerInfo: {
    marginBottom: 25,
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 14,
    color: '#555',
  },
  bold: {
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: primaryColor,
    marginBottom: 10,
  },
  paragraph: {
    fontSize: 15,
    color: '#444',
    lineHeight: 22,
    marginBottom: 10,
  },
  bulletContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    paddingLeft: 5,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#8e44ad',
    marginTop: 8,
    marginRight: 12,
  },
  bulletText: {
    flex: 1,
    fontSize: 15,
    color: '#444',
    lineHeight: 22,
  },
});

export default TermsAndConditionScreen;
