import { StyleSheet, View, Text, SafeAreaView, TouchableOpacity, ScrollView,ActivityIndicator } from 'react-native';
import { MaterialIcons, FontAwesome5, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useState, useCallback } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import * as SecureStore from 'expo-secure-store';
import { useFocusEffect } from '@react-navigation/native';
import { logout } from '../../redux/UserSlice';
import { useSelector , useDispatch} from 'react-redux';
import customaxios from '../customaxios';
const HomeScreen = ({navigation}) => {
  const dispatch = useDispatch();
  
const [data, setData] = React.useState([]);
    const transactions = data.transaction;
      
    const handelLogut = async()=>{
        await SecureStore.deleteItemAsync('token');
       
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      }
      const fetchData = useCallback(async () => {
        try {
          const token = await SecureStore.getItemAsync('token');
          if (token) {
            const response = await customaxios.get('/user', {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (response.status === 200) {
              setData(response.data); 
              
            }
          }
        } catch (error) {
          console.error('Error fetching data:', error.message);
        }
      }, []);
    
      useFocusEffect(
        useCallback(() => {
          fetchData();
        }, [fetchData])
      );

      if(!data){
        return <ActivityIndicator size="large" color="#0000ff" />;
      }
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text style={styles.greeting}>Good afternoon, {data?.user?.name ?? 'Guest'}.</Text>


        <View style={styles.netWorthCard}>
          <View style={styles.netWorthHeader}>
            <Text style={styles.netWorthLabel}>Wallet</Text>
            <Feather name="eye" size={24} color="#666" />
          </View>
          <Text style={styles.netWorthAmount}>{data?.wallet?.[0]?.balance}</Text>

          <View style={styles.balanceRow}>
            <View style={styles.balanceItem}>
              <Text style={styles.balanceLabel}>Assets</Text>
              <Text style={styles.balanceAmount}>{data?.wallet?.[0]?.balance}</Text>
            </View>
            <View style={styles.balanceItem}>
              <Text style={styles.balanceLabel}>Liabilities</Text>
              <Text style={styles.balanceAmount}>$0.00</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
        <View style={styles.sectionHeader}>
  <Text style={styles.sectionTitle}>Budgets</Text>
  {data?.budjet?.[0]?.categories?.length > 0 && (
    <TouchableOpacity onPress={() => navigation.navigate('Budget')}>
      <Text style={{color : 'white'}}>View All</Text>
    </TouchableOpacity>
  )}
</View>


{data?.budjet?.[0]?.categories?.length > 0 ? (
  <View style={styles.budgetCards}>
    {data.budjet[0].categories.slice(0, 2).map((category, index) => (
      <View style={styles.budgetCard} key={index}>
        <MaterialIcons name={category.category.icon} size={24} color={category.category.color} />
        <Text style={styles.budgetTitle}>{category.name}</Text>
        <Text style={styles.budgetAmount}>${category.limit - category.spent} remaining</Text>
        <View style={styles.progressBar}>
          <View 
            style={[styles.progress, { width: `${(category.spent / category.limit) * 100}%`, backgroundColor: '#FF6B6B' }]} 
          />
        </View>
      </View>
    ))}
  </View>
) : (
    <View style={styles.noBudgetContainer}>
      <Text style={styles.noBudgetText}>No budget added yet.</Text>
      <TouchableOpacity style={styles.addBudgetButton} onPress={() => navigation.navigate('AddBudjet', {budjetId : data.budjet[0]._id})}>
        <Text style={styles.addBudgetButtonText}>Add Budget</Text>
      </TouchableOpacity>
    </View>
  )}
</View>


        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Latest Transactions</Text>
            <TouchableOpacity onPress={()=>navigation.navigate('Transaction', {id : data.user._id})}>
              <Text style={styles.viewAll}>View all</Text>
            </TouchableOpacity>
          </View>
          {transactions?.slice().reverse().slice(0, 5).map((transaction, index) => (
            <View key={transaction.id} style={styles.transaction}>
              <View style={styles.transactionIconContainer}>
                <MaterialIcons name={transaction.category.icon} size={24} color={transaction.category.color}/>
               
              </View>
              <View style={styles.transactionInfo}>
                <Text style={styles.transactionTitle}>{transaction.category.name}</Text>
                <Text style={styles.transactionType}>Cash</Text>
              </View>
              <View style={styles.transactionAmount}>
              <Text style={[styles.amount, transaction.type === 'income' ? { color: '#78ff4f' } : {}]}>
  {transaction.type === 'income' ? '+' : '-'} ${Math.abs(transaction.amount).toFixed(2)}
</Text>


                <Text style={styles.transactionTime}>{transaction.time}</Text>
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.doneButton} onPress={()=>handelLogut()}>
                  <Text style={styles.doneButtonText}>Logout</Text>
          </TouchableOpacity>
      </ScrollView>

     
     
    </SafeAreaView>
  )
}

export default HomeScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
      },
      doneButton: {
        backgroundColor: '#9747ff',
        borderRadius: 15,
        padding: 15,
        marginTop: 20,
        margin : 20,
        alignItems: 'center',
      },
      doneButtonText: {
        color: 'white',
        fontWeight: '700',
        fontSize: 18,
      },
      greeting: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        padding: 16,
      },
      netWorthCard: {
        backgroundColor: '#1C1C1E',
        margin: 16,
        padding: 16,
        borderRadius: 12,
      },
      netWorthHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      },
      netWorthLabel: {
        color: '#666',
        fontSize: 16,
      },
      netWorthAmount: {
        color: '#fff',
        fontSize: 32,
        fontWeight: 'bold',
        marginVertical: 8,
      },
      noBudgetContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1C1C1E',
        padding: 20,
        borderRadius: 12,
        margin: 16,
      },
      noBudgetText: {
        color: '#666',
        fontSize: 16,
        marginBottom: 10,
      },
      addBudgetButton: {
        backgroundColor: '#9747ff',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
      },
      addBudgetButtonText: {
        color: 'white',
        fontWeight: 'bold',
      },
      
      balanceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16,
      },
      balanceItem: {
        flex: 1,
        backgroundColor: '#2C2C2E',
        padding: 12,
        borderRadius: 8,
        marginHorizontal: 4,
      },
      balanceLabel: {
        color: '#666',
        fontSize: 14,
      },
      balanceAmount: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginTop: 4,
      },
      section: {
        marginTop: 24,
      },
      sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 16,
      },
      sectionTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
      },
      viewAll: {
        color: '#666',
        fontSize: 14,
      },
      budgetCards: {
        flexDirection: 'row',
        paddingHorizontal: 16,
      },
      budgetCard: {
        flex: 1,
        backgroundColor: '#1C1C1E',
        padding: 16,
        borderRadius: 12,
        marginRight: 8,
      },
      budgetTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginTop: 8,
      },
      budgetAmount: {
        color: '#666',
        fontSize: 14,
        marginTop: 4,
      },
      progressBar: {
        height: 4,
        backgroundColor: '#2C2C2E',
        borderRadius: 2,
        marginTop: 8,
      },
      progress: {
        height: '100%',
        borderRadius: 2,
      },
      budgetPercentage: {
        color: '#666',
        fontSize: 12,
        marginTop: 4,
      },
      transaction: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#1C1C1E',
      },
      transactionIconContainer: {
        width: 40,
        height: 40,
        backgroundColor: '#2C2C2E',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
      },
      transactionInfo: {
        flex: 1,
        marginLeft: 12,
      },
      transactionTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
      },
      transactionType: {
        color: '#666',
        fontSize: 14,
      },
      transactionAmount: {
        alignItems: 'flex-end',
      },
      amount: {
        color: '#FF6B6B',
        fontSize: 16,
        fontWeight: '600',
      },
      transactionTime: {
        color: '#666',
        fontSize: 12,
        marginTop: 4,
      },
      bottomNav: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: '#1C1C1E',
        paddingVertical: 8,
        paddingBottom: 24,
      },
      navItem: {
        padding: 8,
      },
      addButton: {
        backgroundColor: '#2C2C2E',
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
      },
})