import React, { useState, useCallback, useEffect } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Text, TextInput, Button, IconButton, Menu, Portal, Snackbar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialIcons } from '@expo/vector-icons';
import customaxios from './customaxios';
import { useSelector } from 'react-redux';
import * as SecureStore from 'expo-secure-store';


const BudgetManagement = ({route}) => {
  const navigation = useNavigation();
  const {budjetId} = route.params;
  console.log("budjet id ", budjetId);
  const [category, setCategory] = useState('');
  const [limit, setLimit] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [categorys, setCategorys] = useState([]);
  const data = useSelector((state) => state.user.user);
 
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
const getData = async () => {
  try{
     

  }catch(err) {
    console.log(err);
  }
}
  useEffect(() => {
    getCategory();
  }, []);

  const handleDateChange = useCallback((event, selectedDate, type) => {
    if (selectedDate) {
      if (type === 'start') {
        setStartDate(selectedDate);
        setShowStartDatePicker(false);
      } else {
        setEndDate(selectedDate);
        setShowEndDatePicker(false);
      }
    } else {
      setShowStartDatePicker(false);
      setShowEndDatePicker(false);
    }
  }, []);

  const handleCategorySelect = useCallback((item) => {
    setCategory(item);
    setMenuVisible(false);
    setError('');
  }, []);

  const validateForm = useCallback(() => {
    if (!category) {
      setError('Please select a category');
      return false;
    }
    if (!limit || isNaN(Number(limit))) {
      setError('Please enter a valid limit amount');
      return false;
    }
    if (endDate < startDate) {
      setError('End date cannot be before start date');
      return false;
    }
    return true;
  }, [category, limit, startDate, endDate]);

  const handleSaveBudget = useCallback(async () => {
    if (!validateForm()) {
      setSnackbarVisible(true);
      return;
    }
  
    setLoading(true);
    try {
      const token = await SecureStore.getItemAsync('token');
  
      if (!token) {
        throw new Error('No token found');
      }
  
      const response = await customaxios.put(`budjet/${data.user._id}`, {
        name : category.name, category : category._id, limit, startDate, endDate
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
  
      if (response.status === 201) {
        setCategory('');
        setLimit('');
        setStartDate(new Date());
        setEndDate(new Date());
        setError('Budget saved successfully!');
        setSnackbarVisible(true);
        navigation.navigate('Home')
      } else {
        throw new Error('Failed to save budget.');
      }
      
    } catch (err) {
      setError('Failed to save budget. Please try again.');
      setSnackbarVisible(true);
      console.error('Error saving budget:', err);
    } finally {
      setLoading(false);
    }
  }, [category, limit, startDate, endDate, validateForm, data.user]);
  
  
  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <IconButton 
          icon="arrow-left" 
          size={24} 
          color="white"
          onPress={() => navigation.goBack()} 
        />
        <Text style={styles.headerText}>Add Budget</Text>
      </View>

      {/* Form Fields */}
      <View style={styles.form}>
        {/* Category Dropdown */}
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <TouchableOpacity onPress={() => setMenuVisible(true)}>
              <TextInput
                label="Select Category"
                value={category.name || ''}
                style={[styles.input, { color: 'white' }]}  // Ensure the text is white
                mode="outlined"
                editable={false}
                right={<TextInput.Icon name="menu-down" color="white" />}
              />
            </TouchableOpacity>
          }
        >
          {categorys.map((item, index) => (
            <Menu.Item 
              key={index} 
              onPress={() => handleCategorySelect(item)} 
              title={(
                <View style={styles.menuItem}>
                  <MaterialIcons name={item.icon} size={20} color={item.color} />
                  <Text style={styles.menuText}>{item.name}</Text>
                </View>
              )}
            />
          ))}
        </Menu>

        {/* Limit Input */}
        <TextInput
          label="Limit"
          value={limit}
          onChangeText={text => {
            setLimit(text);
            setError('');
          }}
          keyboardType="numeric"
          style={[styles.input, { color: 'white' }]}  // Ensure the text is white
          mode="outlined"
          placeholder="Enter amount"
        />

        {/* Start Date Picker */}
        <TouchableOpacity onPress={() => setShowStartDatePicker(true)}>
          <TextInput
            label="Start Date"
            value={startDate.toISOString().split('T')[0]}
            style={[styles.input, { color: 'white' }]}  
            mode="outlined"
            editable={false}
            right={<TextInput.Icon name="calendar" color="white" />}
          />
        </TouchableOpacity>
        {showStartDatePicker && (
          <DateTimePicker
            value={startDate}
            mode="date"
            display="default"
            onChange={(event, date) => handleDateChange(event, date, 'start')}
          />
        )}

        {/* End Date Picker */}
        <TouchableOpacity onPress={() => setShowEndDatePicker(true)}>
          <TextInput
            label="End Date"
            value={endDate.toISOString().split('T')[0]}
            style={[styles.input, { color: 'white' }]}  
            mode="outlined"
            editable={false}
            right={<TextInput.Icon name="calendar" color="white" />}
          />
        </TouchableOpacity>
        {showEndDatePicker && (
          <DateTimePicker
            value={endDate}
            mode="date"
            display="default"
            onChange={(event, date) => handleDateChange(event, date, 'end')}
          />
        )}

        {/* Save Button */}
        <Button
          mode="contained"
          onPress={handleSaveBudget}
          style={styles.button}
          loading={loading}
          disabled={loading}
        >
          Save Budget
        </Button>
      </View>

      {/* Error Snackbar */}
      <Portal>
        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={3000}
          style={styles.snackbar}
        >
          {error}
        </Snackbar>
      </Portal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  form: {
    padding: 16,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 16,
    backgroundColor: '#007AFF',
    paddingVertical: 8,
  },
  snackbar: {
    backgroundColor: '#333',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuText: {
    marginLeft: 8,
  },
});

export default BudgetManagement;
