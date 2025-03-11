import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import img1 from '../assets/Business deal-cuate.png';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { setUser } from '../redux/UserSlice';
import { useDispatch } from 'react-redux';
import customaxios from '../Component/customaxios';
import * as Updates from 'expo-updates';
const Login = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const handleLogin = async () => {
    if (!email || !password) {
      alert('Please fill all fields');
      return;
    }
    try {
      const res = await customaxios.post('/user/login', {
        email,
        password
      });
      if (res.status === 200) {
        console.log(res.data);
        await SecureStore.setItemAsync('token', res.data.token);
    await Updates.reloadAsync()
      } else {
        alert('User registration failed');
      }
    } catch (error) {
      console.log(error);
    Alert.alert('Error', error.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image
        source={img1}
        style={styles.image}
      />
      <Text style={styles.header}>Login</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#aaa"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#aaa"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity onPress={handleLogin} style={styles.buttonContainer}>
        <LinearGradient
          colors={['#8A2BE2', '#9400D3']} 
          style={styles.registerButton}
        >
          <Text style={styles.buttonText}>Login</Text>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.loginLink}>Don't have an account? Register</Text>
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

export default Login;
