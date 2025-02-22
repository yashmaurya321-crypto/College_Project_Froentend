import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Register from './Screens/Register';
import Login from './Screens/Login';
import Home from './Screens/Home';
import { Provider, useDispatch, useSelector } from 'react-redux';
import store from './redux/store';
import { setUser } from './redux/UserSlice';
import customaxios from './Component/customaxios';
import AddTransaction from './Component/Home/AddTransaction';
import AddWalletScreen from './Component/AddWalletScreen';
import BudgetManagement from './Component/AddBudjetScreen';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
const Stack = createStackNavigator();

function AppNavigator() {
  const [isLogin, setIsLogin] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // New loading state
  const dispatch = useDispatch();
  const userData = useSelector((state) => state.user.user);

  const fetchData = async () => {
    try {
      const token = await SecureStore.getItemAsync('token');
      if (token) {
        const response = await customaxios.get('/user', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.status === 200) {
          dispatch(setUser(response.data));
          setIsLogin(true);
        } else {
          setIsLogin(false);
        }
      } else {
        setIsLogin(false);
      }
    } catch (error) {
      console.error('Error fetching data:', error.message);
      setIsLogin(false);
    } finally {
      setIsLoading(false); // Set loading to false after fetching is done
    }
  };

  useEffect(() => {
    fetchData(); // Call fetchData only once when the component mounts
  }, []); // Empty dependency array ensures this runs once on mount

  if (isLoading) {
    return (
      <View style={styles.container}>
        {/* You can show a loading spinner here */}
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={isLogin ? 'Home' : 'Login'}>
      {/* <Stack.Navigator initialRouteName={'AddBudjet'}> */}
        <Stack.Screen name="Home" component={Home} options={{ headerShown: false }} />
        <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
        <Stack.Screen name="Register" component={Register} options={{ headerShown: false }} />
        <Stack.Screen name="AddWallet" component={AddWalletScreen} options={{ headerShown: false }} />
        <Stack.Screen name="AddBudjet" component={BudgetManagement} options={{headerShown: false  }} />

        <Stack.Screen 
  name="AddTransaction" 
  component={AddTransaction} 
  options={{
    headerStyle: { backgroundColor: 'black' },
    headerTintColor: 'white', 
    headerTitleStyle: { fontWeight: 'bold' }, 
  }} 
/>

      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <PaperProvider >
    <Provider store={store}>
      <AppNavigator />
    </Provider>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
