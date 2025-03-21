import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { MaterialIcons } from '@expo/vector-icons';
import customaxios from '../customaxios';
import * as SecureStore from 'expo-secure-store';

const Transactions = ({ route }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!route?.params?.id) {
        setError('No ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
          const token = await SecureStore.getItemAsync('token');
        const res = await customaxios.get(`/transaction/${route.params.id}`,{
        
            headers: { Authorization: `Bearer ${token}` },
       
        });
        setTransactions(res.data);
        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to fetch transactions');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [route?.params?.id]);

  const groupTransactionsByDate = (transactions) => {
    if (!Array.isArray(transactions)) return {};

  const grouped = {};

  transactions.forEach((transaction) => {
    const date = new Date(transaction.date);
    const year = date.getFullYear();
    
    const weekNumber = getWeekNumber(date);

    const key = `${year}-W${weekNumber}`;

    if (!grouped[key]) {
      grouped[key] = [];
    }

    grouped[key].push(transaction);
  });

  return grouped;
  };
const getWeekNumber = (date) => {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDays = Math.floor((date - startOfYear) / (24 * 60 * 60 * 1000));
  
  return Math.ceil((pastDays + startOfYear.getDay() + 1) / 7);
};
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Transactions</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading transactions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Transactions</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const groupedTransactions = groupTransactionsByDate(transactions);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Transactions</Text>
      </View>

      {Object.keys(groupedTransactions).length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No transactions found</Text>
        </View>
      ) : (
        <ScrollView>
          {Object.entries(groupedTransactions).map(([date, dayTransactions]) => (
            <View key={date}>
              <View style={styles.dateHeader}>
                <Text style={styles.dateText}>{date}</Text>
              </View>
              
              {dayTransactions.map((transaction) => (
                <TouchableOpacity 
                  key={transaction._id || transaction.id} 
                  style={styles.transaction}
                >
                  <View style={[
                    styles.transactionIconContainer, 
                    transaction.type === 'income' && styles.incomeIconContainer
                  ]}>
                    <MaterialIcons 
                      name={transaction.category?.icon || 'attach-money'} 
                      size={24} 
                      color={transaction.category?.color || '#fff'}
                    />
                  </View>
                  
                  <View style={styles.transactionInfo}>
                    <Text style={styles.transactionTitle}>
                      {transaction.category.name || 'Unknown Category'}
                    </Text>
                    <Text style={styles.transactionType}>
                      {transaction.type?.charAt(0).toUpperCase() + transaction.type?.slice(1)}
                    </Text>
                  </View>
                  
                  <View style={styles.transactionAmount}>
                    <Text style={[
                      styles.amount,
                      transaction.type === 'expense' ? styles.expenseAmount : styles.incomeAmount,
                    ]}>
                      {transaction.type === 'expense' ? '-' : '+'} $
                      {Math.abs(transaction.amount).toFixed(2)}
                    </Text>
                    <Text style={styles.transactionTime}>
                      {transaction.date || new Date(transaction.date).toLocaleTimeString()}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </ScrollView>
      )}

      <View style={styles.bottomButtons}>
        <TouchableOpacity style={styles.downloadButton}>
          <MaterialIcons name="file-download" size={24} color="#fff" />
          <Text style={styles.downloadButtonText}>Download</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 16,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1C1C1E',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  dateHeader: {
    padding: 16,
    backgroundColor: '#1C1C1E',
  },
  dateText: {
    color: '#666',
    fontSize: 14,
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
  incomeIconContainer: {
    backgroundColor: '#1B5E20',
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
    fontSize: 16,
    fontWeight: '600',
  },
  incomeAmount: {
    color: '#4CAF50',
  },
  expenseAmount: {
    color: '#FF6B6B',
  },
  transactionTime: {
    color: '#666',
    fontSize: 12,
    marginTop: 4,
  },
  bottomButtons: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: '#1C1C1E',
  },
  downloadButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2C2C2E',
    padding: 12,
    borderRadius: 8,
    marginLeft: 8,
  },
  downloadButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Transactions;