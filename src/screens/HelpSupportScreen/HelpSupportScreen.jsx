import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { primaryColor } from '../../constants/colors';

const helpTopics = [
  'My Account',
  'My Services',
  'Payment',
  'Vouchers',
  'My Support Request',
];

const faqData = [
  {
    id: '1',
    question: '01. How can I book service?',
    answer:
      'Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of',
  },
  {
    id: '2',
    question: '02. What`s your mission?',
    answer:
      'Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of',
  },
  {
    id: '3',
    question: '03. How many cost for spa?',
    answer:
      'Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of',
  },
  {
    id: '4',
    question: '04. How to contact with your beauty expert?',
    answer:
      'Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of',
  },
];

const FaqItem = ({ item, isOpen, onPress }) => (
  <View style={styles.faqItemContainer}>
    <TouchableOpacity style={styles.faqQuestionRow} onPress={onPress}>
      <Text style={styles.faqQuestionText}>{item.question}</Text>
      <Ionicons
        name={isOpen ? 'chevron-up' : 'chevron-down'}
        size={22}
        color="#555"
      />
    </TouchableOpacity>
    {isOpen && (
      <View style={styles.faqAnswerContainer}>
        <Text style={styles.faqAnswerText}>{item.answer}</Text>
      </View>
    )}
  </View>
);

const HelpSupportScreen = ({ navigation }) => {
  const [openFaqId, setOpenFaqId] = useState('3');

  const handleFaqPress = id => {
    setOpenFaqId(openFaqId === id ? null : id);
  };

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

      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.mainTitle}>Help & Support</Text>

          {/* <Text style={styles.sectionTitle}>How Can We Help You?</Text>
          {helpTopics.map(topic => (
            <TouchableOpacity key={topic} style={styles.helpItem}>
              <Text style={styles.helpItemText}>{topic}</Text>
              <Ionicons name="chevron-forward" size={22} color="#888" />
            </TouchableOpacity>
          ))} */}

          <Text style={styles.sectionTitle}>FAQ</Text>
          {faqData.map(item => (
            <FaqItem
              key={item.id}
              item={item}
              isOpen={openFaqId === item.id}
              onPress={() => handleFaqPress(item.id)}
            />
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#0D0618',
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
    fontWeight: '500',
  },
  container: {
    flex: 1,
    marginTop: 100,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
  },
  mainTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: '#160B26',
    textAlign: 'center',
    marginTop: 25,
    marginBottom: 20,
    letterSpacing: 0.3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#160B26',
    marginVertical: 15,
    letterSpacing: 0.2,
    borderLeftWidth: 3,
    borderLeftColor: '#D41172',
    paddingLeft: 10,
  },
  helpItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  helpItemText: {
    fontSize: 16,
    color: '#374151',
  },
  faqItemContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  faqQuestionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
  },
  faqQuestionText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  faqAnswerContainer: {
    backgroundColor: '#FFF0F7',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FFE0EF',
  },
  faqAnswerText: {
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 24,
  },
});

export default HelpSupportScreen;
