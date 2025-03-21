import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import React, { useEffect } from 'react';
import { useSelector , useDispatch} from 'react-redux';
import { Button } from 'react-native-paper';
import * as SecureStore from 'expo-secure-store';
import { logout } from '../redux/UserSlice';
import HomeScreen from '../Component/Home/Home';
import Transaction from '../Component/Home/Transactions';
import Report from '../Component/Home/Report';
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import AddTransaction from '../Component/Home/AddTransaction';
import Budget from '../Component/Home/Budjet';
import Ai from './Ai';
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();
const Home = ({ navigation }) => {
  const data = useSelector((state) => state.user.user); 
const dispatch = useDispatch();
  useEffect(() => {
   
    if (!data) {
      navigation.navigate('Login');
    }
  }, [data, navigation]);


const StackHHome = () => {
    return (
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen}options={{headerShown: false}}/>
     
        <Stack.Screen name="Budget" component={Budget} options={{
    headerStyle: { backgroundColor: 'black' }, 
    headerTintColor: 'white', 
    headerTitleStyle: { fontWeight: 'bold' },
  }} />
      </Stack.Navigator>
    );
}
const StackReport = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Report" component={Report}options={{headerShown: false}}/>
   
      <Stack.Screen name="Ai" component={Ai} options={{
  headerStyle: { backgroundColor: 'black' }, 
  headerTintColor: 'white', 
  headerTitleStyle: { fontWeight: 'bold' }, 
}} />
    </Stack.Navigator>
  );
}
  return (
    <Tab.Navigator
  screenOptions={({ route }) => ({
    headerShown: false,
    tabBarStyle: {
      backgroundColor: 'black', 
      borderTopColor: 'violet',
      height: 60,
      paddingBottom: 5,
      position: 'relative',
      flexDirection: 'row', 
      justifyContent: 'space-between', 
    },
    tabBarIcon: ({ focused, color, size }) => {
      let iconName;
      if (route.name === 'Home') {
        iconName = focused ? 'home' : 'home-outline';
      } else if (route.name === 'Transaction') {
        iconName = focused ? 'cash' : 'cash-outline'; 
      } else if (route.name === 'Reports') {
        iconName = focused ? 'document' : 'document-outline';
      }
      return <Ionicons name={iconName} size={size} color={color} />;
    },
    tabBarActiveTintColor: 'violet', 
    tabBarInactiveTintColor: 'gray',
  })}
>
  <Tab.Screen name="Home" component={StackHHome} />
  <Tab.Screen 
    name="Transaction" 
    component={Transaction} 
    options={{
      tabBarButton: () => (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          
          <TouchableOpacity 
            style={{
              backgroundColor: 'violet', 
              borderRadius: 50, 
              padding: 10,
              position: 'absolute', 
              top: -20, 
              zIndex: 1, 
            }}
            onPress={() => {
              navigation.navigate('AddTransaction')
             
            }}
          >
            <Ionicons name="add" size={30} color="white" />
          </TouchableOpacity>
        </View>
      ),
    }}
  />
  <Tab.Screen name="Reports" component={StackReport} />
</Tab.Navigator>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black'
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  dataText: {
    marginTop: 10,
    fontSize: 16,
    color: 'gray',
  },
});