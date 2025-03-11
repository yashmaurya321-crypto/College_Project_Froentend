import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Dimensions, 
  ScrollView,
  ActivityIndicator ,
  TouchableOpacity
} from 'react-native';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { useFocusEffect } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import customaxios from '../customaxios';

const Report = ({ navigation }) => {
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

  // Currency Formatter
  const formatCurrency = (amount) => 
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);

  // Loading State
  if (loading || !transactionData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  // No Data State
  if (!transactionData || Object.keys(transactionData).length === 0 || !transactionData.balanceTrend?.length) {
    return (
      <View style={styles.noDataContainer}>
        <Text style={styles.noDataText}>No Data Available</Text>
      </View>
    );
  }

  // Balance Trend Line Chart Configuration
  const balanceTrendData = {
    labels: transactionData.balanceTrend.map(() => ""),
    datasets: [{
      data: transactionData.balanceTrend.map(d => d.balance),
      color: (opacity = 1) => `rgba(65, 105, 225, ${opacity})`,
    }]
  };

  // Expense Pie Chart Configuration
  const pieChartData = transactionData.categorySummary.expenses.map(category => ({
    name: category.name,
    amount: category.totalAmount,
    color: category.color,
    legendFontColor: "#fff",
    legendFontSize: 12
  }));

  const chartConfig = {
    backgroundColor: '#1e1e1e',
    backgroundGradientFrom: '#1e1e1e',
    backgroundGradientTo: '#1e1e1e',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    style: {
      borderRadius: 16
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Balance Trend Section */}
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
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.lineChart}
        />
      </View>

      {/* Expense Breakdown Section */}
      <View style={styles.trendContainer}>
        <Text style={styles.sectionTitle}>Expense Breakdown</Text>
        <PieChart
          data={pieChartData}
          width={screenWidth - 40}
          height={220}
          chartConfig={chartConfig}
          accessor={"amount"}
          backgroundColor={"transparent"}
          center={[10, 0]}
          absolute
        />
      </View>

      {/* AI Assistance Button */}
      <View style={styles.aiButtonContainer}>
        <TouchableOpacity 
          style={styles.aiButton}
          onPress={() => navigation.navigate('Ai')}
        >
          <Text style={styles.aiButtonText}>Get AI Assistance</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e1e1e',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1e1e1e',
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
  aiButtonContainer: {
    margin: 10,
  },
  aiButton: {
    backgroundColor: '#9747ff',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
  },
  aiButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 18,
  }
});

export default Report;