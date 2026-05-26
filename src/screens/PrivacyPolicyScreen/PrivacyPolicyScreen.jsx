import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  Linking,
} from 'react-native';
import { primaryColor } from '../../constants/colors';

const BulletPoint = ({ text }) => (
  <View style={styles.bulletContainer}>
    <View style={styles.bullet} />
    <Text style={styles.bulletText}>{text}</Text>
  </View>
);

const PrivacyPolicyScreen = () => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        style={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.mainTitle}>Privacy Policy</Text>

        <View style={styles.headerInfo}>
          <Text style={styles.headerText}>
            <Text style={styles.bold}>App Name:</Text> orucom
          </Text>
          <Text style={styles.headerText}>
            <Text style={styles.bold}>Company:</Text> Nomino Innovations Private
            Limited
          </Text>
          <Text style={styles.headerText}>
            <Text style={styles.bold}>Last Updated:</Text> May 19, 2026
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Introduction</Text>
          <Text style={styles.paragraph}>
            Nomino Innovations Private Limited ("we," "our," or "us") operates
            the orucom mobile application. We are committed to protecting your
            personal information and your right to privacy. This privacy policy
            explains what data we collect, why we collect it, and how we keep it
            safe.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Information We Collect</Text>
          <Text style={styles.paragraph}>
            We only collect data that is strictly necessary to provide our slot
            booking services.
          </Text>

          <Text style={[styles.paragraph, styles.bold, { marginBottom: 5 }]}>
            Data from Google Sign-In:
          </Text>
          <Text style={styles.paragraph}>
            Our application exclusively uses Google Login for customer
            authentication. We do not offer or process public account
            registrations via standard email and password. When you log in, we
            securely receive basic profile information from your Google account,
            specifically your Name and Email Address.
          </Text>

          <BulletPoint text="Personal Data: To facilitate salon bookings and coordination, we will additionally request your Phone Number." />
          <BulletPoint text="Booking Data: Details of appointments you book (Date, Time, Service requested, and the Salon Name)." />
          <BulletPoint text="Device Information: We automatically collect basic device and usage information (such as your IP address, operating system, and app crash logs) to diagnose technical issues and improve app stability." />
          <BulletPoint text="Location Data: We request access to your location to suggest Service Providers near you. This is only collected if you grant explicit permission." />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            3. How We Use Your Information
          </Text>
          <Text style={styles.paragraph}>
            We use the information we collect to:
          </Text>
          <BulletPoint text="Facilitate account creation and secure login via your Google Account." />
          <BulletPoint text="Fulfill and manage your salon bookings." />
          <BulletPoint text="Send administrative notifications, including booking confirmations and reminders via App Notifications or WhatsApp." />
          <BulletPoint text="Monitor app performance and prevent fraudulent activities." />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            4. Analytics and Tracking Technologies
          </Text>
          <Text style={styles.paragraph}>
            We partner with Microsoft Clarity and Microsoft Advertising to
            capture how you use and interact with our app/website through
            behavioral metrics, heatmaps, and session replay to improve and
            market our products/services. Usage data is captured using first and
            third-party cookies and other tracking technologies to determine the
            popularity of products/services and online activity. Additionally,
            we use this information for site optimization, fraud/security
            purposes, and advertising. For more information about how Microsoft
            collects and uses your data, visit the{' '}
            <Text
              style={{ color: primaryColor, textDecorationLine: 'underline' }}
              onPress={() =>
                Linking.openURL(
                  'https://www.microsoft.com/privacy/privacystatement',
                )
              }
            >
              Microsoft Privacy Statement
            </Text>
            .
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            5. Data Sharing and Third Parties
          </Text>
          <Text style={styles.paragraph}>
            We do not sell your personal data. We only share your data in the
            following specific scenarios:
          </Text>
          <BulletPoint text="Service Providers (Salons): We share your Name and Phone Number with the specific Salon you have chosen to book with, so they can manage your appointment." />
          <BulletPoint text="Analytics Partners: We share usage and behavioral data with Microsoft as detailed in Section 4." />
          <BulletPoint text="Legal Obligations: We may disclose your information where legally required to comply with applicable laws or governmental requests." />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            6. Data Retention and Account Deletion (User Rights)
          </Text>
          <Text style={styles.paragraph}>
            You have full control over your data. We retain your data only for
            as long as your account is active.
          </Text>
          <Text style={[styles.paragraph, styles.bold]}>
            How to Delete Your Account & Data:
          </Text>
          <Text style={styles.paragraph}>
            You can request the complete deletion of your account and all
            associated personal data at any time by using the dedicated Account
            Deletion Link provided within the app (Menu {'>'} Delete Account) or
            by requesting account deletion by contacting
            nominoinnovations@gmail.com.
          </Text>
          <Text style={styles.paragraph}>
            Upon submitting the deletion request through the provided link, all
            your personal information, booking history, and Google Login
            associations will be permanently removed from our active databases.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            7. Security of Your Information
          </Text>
          <Text style={styles.paragraph}>
            We implement industry-standard security measures to protect your
            personal information during transmission and storage. However, no
            digital platform can guarantee 100% security.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. Children's Privacy</Text>
          <Text style={styles.paragraph}>
            orucom is not intended for children under the age of 18. We do not
            knowingly collect personal data from minors.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>9. Contact Us</Text>
          <Text style={styles.paragraph}>
            If you have questions, concerns, or requests regarding this policy,
            please contact us at:
          </Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Email:</Text> nominoinnovations@gmail.com
          </Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Address:</Text>
            {'\n'}NOMINO INNOVATIONS PRIVATE LIMITED
            {'\n'}Door No: 155,
            {'\n'}Building ID: 50916010009071
            {'\n'}Ward No: 6-Neerad, Kondotty
            {'\n'}Malappuram
            {'\n'}Kerala - 673638
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
  },
  headerText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
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

export default PrivacyPolicyScreen;
