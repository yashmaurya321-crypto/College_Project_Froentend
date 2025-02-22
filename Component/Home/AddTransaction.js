import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  TextInput, 
  StatusBar,
  Dimensions,
  Platform,
  Modal,
  FlatList,
  Alert
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialIcons } from '@expo/vector-icons';
import customaxios from '../customaxios';
import { setUser } from '../../redux/UserSlice';
import * as SecureStore from 'expo-secure-store';
import { useSelector, useDispatch } from 'react-redux';

const { width } = Dimensions.get('window');

const AddTransaction = ({navigation}) => {
  const [transactionType, setTransactionType] = useState('Expense');
  const data = useSelector((state) => state.user.user);
  const dispatch = useDispatch();

  // Date and Time state
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateString, setDateString] = useState(new Date().toLocaleDateString());
  const [time, setTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [name, setName] = useState('');
  const [category, setCategory] = useState('Select a category');
  const [amount, setAmount] = useState('');
  const [categorys, setCategorys] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);

  const getCategory = async () => {
    try {
      const res = await customaxios.get('/categories');
      if (res.status === 200) {
        setCategorys(res.data);
      } else {
        console.log("No categories found");
      }
    } catch(err) {
      console.log(err);
      Alert.alert("Error", "Failed to fetch categories");
    }
  };

  useEffect(() => {
    getCategory();
  }, []);

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
      setDateString(selectedDate.toLocaleDateString());
    }
  };

  const onTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setTime(selectedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }
  };

  const handleCategorySelect = (selectedCategory) => {
    setCategory(selectedCategory.name);
    setSelectedCategoryId(selectedCategory._id);
    setIsCategoryModalVisible(false);
  };

  const filteredCategories = categorys.filter(
    cat => cat.type.toLowerCase() === transactionType.toLowerCase()
  );

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.categoryItem} 
      onPress={() => handleCategorySelect(item)}
    >
      <MaterialIcons 
        name={item.icon} 
        size={24} 
        color={item.color} 
        style={styles.categoryIcon}
      />
      <Text style={styles.categoryText}>{item.name}</Text>
    </TouchableOpacity>
  );

  const handleSubmitTransaction = async () => {
    if (!name || !selectedCategoryId || !amount) {
      console.log(name, selectedCategoryId,amount);
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
  
    try {
      const token = await SecureStore.getItemAsync('token');
  
      const transactionData = {
        type: transactionType.toLowerCase(),
        name,
        category: selectedCategoryId,
        amount: parseFloat(amount),
        date: date,
        time
      };
  
      const res = await customaxios.post('/transaction', transactionData, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      if (res.status === 201) {
        Alert.alert("Success", "Transaction added successfully");
  
        const updatedWallet = data.wallet.map((wallet, index) =>
          index === 0
            ? {
                ...wallet,
                balance: transactionData.type === 'income'
                  ? (wallet.balance || 0) + transactionData.amount
                  : (wallet.balance || 0) - transactionData.amount
              }
            : wallet
        );
  
        dispatch(setUser({
          ...data,
          wallet: updatedWallet
        }));
  
        setName('');
        setCategory('Select a category');
        setAmount('');
        setSelectedCategoryId(null);
        navigation.navigate('Home')
      } else {
        Alert.alert("Error", "Failed to add transaction");
      }
    } catch(err) {
      console.log('Error:', err);
      Alert.alert("Error", "An error occurred while adding transaction");
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.transactionTypeContainer}>
        {['Expense', 'Income'].map((type) => (
          <TouchableOpacity 
            key={type}
            style={[
              styles.transactionTypeButton, 
              transactionType === type && styles.activeTransactionType
            ]}
            onPress={() => {
              setTransactionType(type);
              setCategory('Select a category');
              setSelectedCategoryId(null);
            }}
          >
            <Text style={styles.transactionTypeText}>{type}</Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <View style={styles.formContainer}>
        <View style={styles.inputRow}>
          <View style={styles.halfInput}>
            <Text style={styles.inputLabel}>Date</Text>
            <TouchableOpacity 
              style={styles.input}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateText}>{dateString}</Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onDateChange}
              />
            )}
          </View>
          <View style={styles.halfInput}>
            <Text style={styles.inputLabel}>Time</Text>
            <TouchableOpacity 
              style={styles.input}
              onPress={() => setShowTimePicker(true)}
            >
              <Text style={styles.dateText}>{time}</Text>
            </TouchableOpacity>
            {showTimePicker && (
              <DateTimePicker
                value={date}
                mode="time"
                is24Hour={false}
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onTimeChange}
              />
            )}
          </View>
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Name</Text>
          <TextInput 
            style={styles.input} 
            value={name} 
            onChangeText={setName}
            placeholderTextColor="#8E8E93"
            placeholder="Enter transaction name"
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Category</Text>
          <TouchableOpacity 
            style={styles.selectInput} 
            onPress={() => setIsCategoryModalVisible(true)}
          >
            <Text style={[
              styles.selectInputText,
              category !== 'Select a category' && styles.selectedCategoryText
            ]}>
              {category}
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Amount</Text>
          <TextInput 
            style={styles.input} 
            value={amount} 
            onChangeText={setAmount}
            keyboardType="numeric"
            placeholderTextColor="#8E8E93"
            placeholder="Enter amount"
          />
        </View>
        
        <TouchableOpacity 
          style={styles.doneButton}
          onPress={handleSubmitTransaction}
        >
          <Text style={styles.doneButtonText}>Confirm Transaction</Text>
        </TouchableOpacity>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isCategoryModalVisible}
        onRequestClose={() => setIsCategoryModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select {transactionType} Category</Text>
            <FlatList
              data={filteredCategories}
              renderItem={renderCategoryItem}
              keyExtractor={(item) => item._id}
              numColumns={3}
              contentContainerStyle={styles.categoryGrid}
            />
            <TouchableOpacity 
              style={styles.closeModalButton} 
              onPress={() => setIsCategoryModalVisible(false)}
            >
              <Text style={styles.closeModalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
  },
  transactionTypeContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  transactionTypeButton: {
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 5,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  activeTransactionType: {
    backgroundColor: '#9747ff',
  },
  transactionTypeText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
  },
  formContainer: {
    paddingHorizontal: 20,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  inputGroup: {
    marginTop: 15,
  },
  inputLabel: {
    color: '#8E8E93',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    color: 'white',
    borderRadius: 15,
    padding: 15,
    fontSize: 16,
  },
  dateText: {
    color: 'white',
    fontSize: 16,
  },
  selectInput: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    padding: 15,
  },
  selectInputText: {
    color: '#8E8E93',
    fontSize: 16,
  },
  selectedCategoryText: {
    color: 'white',
  },
  doneButton: {
    backgroundColor: '#9747ff',
    borderRadius: 15,
    padding: 15,
    marginTop: 20,
    alignItems: 'center',
  },
  doneButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 18,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#1E1E1E',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 20,
  },
  categoryGrid: {
    justifyContent: 'center',
  },
  categoryItem: {
    alignItems: 'center',
    margin: 10,
    width: 80,
  },
  categoryIcon: {
    marginBottom: 5,
  },
  categoryText: {
    color: 'white',
    fontSize: 12,
    textAlign: 'center',
  },
  closeModalButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#9747ff',
    borderRadius: 10,
  },
  closeModalButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});

export default AddTransaction;