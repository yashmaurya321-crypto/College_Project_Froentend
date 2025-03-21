import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import customaxios from './customaxios';
const AddWalletScreen = ({ route}) => {
    const { userId } = route.params;
  const navigation = useNavigation();
  const [walletName, setWalletName] = useState('');
  const [initialBalance, setInitialBalance] = useState('');

  const handleAddWallet = async() => {
    if (!walletName || !initialBalance) {
      alert('Please fill in all fields');
      return;
    }
    
    const balance = parseFloat(initialBalance);
    if (isNaN(balance) || balance < 0) {
      alert('Enter a valid balance');
      return;
    }
    
  try{
const res = await customaxios.put(`/wallet/${userId}`, {balance});
if(res.status === 200){
  Alert.alert('Wallet added successfully');
  navigation.navigate('Login')
}
  }catch(error){
    console.log(error)
  }
 
  
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add New Wallet</Text>
      <TextInput
        style={styles.input}
        placeholder="Wallet Name"
        placeholderTextColor="#888"
        value={walletName}
        onChangeText={setWalletName}
      />
      <TextInput
        style={styles.input}
        placeholder="Initial Balance"
        placeholderTextColor="#888"
        keyboardType="numeric"
        value={initialBalance}
        onChangeText={setInitialBalance}
      />
      <TouchableOpacity style={styles.addButton} onPress={handleAddWallet}>
        <Text style={styles.addButtonText}>Add Wallet</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    backgroundColor: '#1E1E1E',
    color: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#9747ff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default AddWalletScreen;
