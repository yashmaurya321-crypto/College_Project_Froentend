import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import customaxios from '../customaxios';
import { useSelector } from 'react-redux';

const getMaxValue = (data) => {
  return Math.max(
    ...data.map(day => 
      Math.max(
        day.transactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0),
        day.transactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0)
      )
    )
  );
};

const SummaryContainer = ({ transactionData, formatCurrency }) => {
  const maxValue = getMaxValue(transactionData.weeklyData);
  const BAR_HEIGHT = 150;

  return (
    <View style={styles.summaryContainer}>
      <View style={styles.balanceRow}>
        <View>
          
        </View>
        <View>
        
        </View>
      </View>

      <View style={styles.barChart}>
        {transactionData.weeklyData.map((day, index) => {
          const income = day.transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
          const expense = day.transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

          const incomeHeight = (income / maxValue) * BAR_HEIGHT;
          const expenseHeight = (expense / maxValue) * BAR_HEIGHT;

          return (
            <View key={index} style={styles.barColumn}>
              <View style={styles.bars}>
                <View style={styles.barValues}>
                  {income > 0 && (
                    <Text style={styles.barAmount}>
                      {formatCurrency(income)}
                    </Text>
                  )}
                  {expense > 0 && (
                    <Text style={styles.barAmount}>
                      {formatCurrency(expense)}
                    </Text>
                  )}
                </View>
                <View style={styles.barContainer}>
                  {income > 0 && (
                    <View 
                      style={[
                        styles.bar, 
                        styles.incomeBar, 
                        { height: Math.max(incomeHeight, 20) }
                      ]} 
                    />
                  )}
                  {expense > 0 && (
                    <View 
                      style={[
                        styles.bar, 
                        styles.expenseBar, 
                        { height: Math.max(expenseHeight, 20) }
                      ]} 
                    />
                  )}
                </View>
                <Text style={styles.dayLabel}>{day.day}</Text>
              </View>
            </View>
          );
        })}
      </View>
     
    </View>
  );
};

const Report = ({navigation}) => {
  const [transactionData, setTransactionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const screenWidth = Dimensions.get('window').width;
  const data = useSelector((state) => state.user.user); 
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await customaxios(`/user/${data.user._id}`);
      setTransactionData(response.data);
    } catch (error) {
      console.error("Error fetching transaction data:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchTransactions();
    }, [])
  );

  const formatCurrency = (amount) => 
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);

  if (loading || !transactionData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!transactionData || Object.keys(transactionData).length === 0 || !transactionData.balanceTrend?.length) {
    return (
      <View style={styles.noDataContainer}>
        <Text style={styles.noDataText}>No Data Available</Text>
      </View>
    );
  }

  const balanceTrendData = {
    labels: transactionData.balanceTrend.map(d => ""),
    datasets: [{
      data: transactionData.balanceTrend.map(d => d.balance),
      color: (opacity = 1) => `rgba(65, 105, 225, ${opacity})`,
    }]
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Report</Text>
        <Text style={styles.subtitle}>This Week</Text>
      </View>

      <ScrollView>
        <View style={styles.trendContainer}>
          <Text style={styles.sectionTitle}>Balance Trend</Text>
          <View style={styles.balanceRow}>
            <View>
              <Text style={styles.balanceLabel}>Total Income</Text>
              <Text style={styles.balanceAmount}>
                {formatCurrency(transactionData.summary.totalIncome)}
              </Text>
            </View>
            <View>
              <Text style={styles.balanceLabel}>Total Expense</Text>
              <Text style={styles.balanceAmount}>
                {formatCurrency(transactionData.summary.totalExpense)}
              </Text>
            </View>
          </View>

          <LineChart
            data={balanceTrendData}
            width={screenWidth - 40}
            height={120}
            chartConfig={{
              backgroundColor: '#1e1e1e',
              backgroundGradientFrom: '#1e1e1e',
              backgroundGradientTo: '#1e1e1e',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              style: {
                borderRadius: 16
              }
            }}
            bezier
            style={styles.lineChart}
          />
        </View>

        <SummaryContainer 
          transactionData={transactionData}
          formatCurrency={formatCurrency}
        />
      </ScrollView>
      <TouchableOpacity style={{
        backgroundColor: '#9747ff',
        borderRadius: 15,
        padding: 15,
        marginTop: 20,
        margin : 10,
        alignItems: 'center',
      }} onPress={()=>navigation.navigate('Ai')}>
                  <Text style={{ color: 'white',
        fontWeight: '700',
        fontSize: 18,}}>Get Ai Assistence</Text>
          </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1e1e1e',
  },
  container: {
    flex: 1,
    backgroundColor: '#1e1e1e',
  },
  header: {
    padding: 20,
    paddingTop: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 18,
    color: '#fff',
    marginTop: 10,
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1e1e1e',
  },
  noDataText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  trendContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 15,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  balanceLabel: {
    color: '#888',
    fontSize: 14,
  },
  balanceAmount: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  lineChart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  summaryContainer: {
    padding: 20,
    backgroundColor: '#1e1e1e',
  },
  barChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 230, // BAR_HEIGHT + extra space for labels
    marginTop: 20,
  },
  barColumn: {
    flex: 1,
    marginHorizontal: 4,
  },
  bars: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  barContainer: {
    width: '100%',
    alignItems: 'center',
  },
  barValues: {
    alignItems: 'center',
    marginBottom: 4,
  },
  barAmount: {
    color: '#888',
    fontSize: 10,
  },
  bar: {
    width: '60%',
    borderRadius: 4,
    marginVertical: 1,
    minHeight: 20,
  },
  incomeBar: {
    backgroundColor: '#4caf50',
  },
  expenseBar: {
    backgroundColor: '#ff5252',
  },
  dayLabel: {
    color: '#888',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
});

export default Report;