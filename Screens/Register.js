import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, ScrollView } from 'react-native';
import { Button } from 'react-native-paper';
import img1 from '../assets/Business deal-cuate.png'
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import customaxios from '../Component/customaxios';
const Register = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async() => {
    if (!name || !email || !phone || !password) {
      alert('Please fill all fields');
      return;
    }
    try{
const res = await customaxios.post('/user', {
  name : name,
  email: email,
  phone: phone,
  password: password
})
if(res.status === 201){
  alert('User registered successfully')
  const userId = res.data.Data._id; 

           
            navigation.navigate('AddWallet', { userId });

}else{
  alert('User registration failed')
}
    }catch(error){
      console.log(error)
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image
        source={img1} 
        style={styles.image}
      />

      <Text style={styles.header}>Create Account</Text>

      <TextInput
        style={styles.input}
        placeholder="Full Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

<TouchableOpacity onPress={handleRegister} style={styles.buttonContainer}>
            <LinearGradient
                colors={['#8A2BE2', '#9400D3']} 
                style={styles.registerButton}
            >
                <Text style={styles.buttonText}>Register</Text>
            </LinearGradient>
        </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.loginLink}>Already have an account? Login</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: 'black',
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: 'white',
  },
  input: {
    backgroundColor: 'white',
    height: 50,
    marginBottom: 12,
    paddingLeft: 15,
    borderRadius: 8,
    fontSize: 16,
  },
  buttonContainer: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  registerButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  loginLink: {
    textAlign: 'center',
    marginTop: 15,
    color: 'white',
    fontSize: 16,
  },
});

export default Register;
