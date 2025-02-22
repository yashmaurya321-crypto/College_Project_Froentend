import React, { useState, useEffect } from 'react';
import { ScrollView, View, StyleSheet, Dimensions } from 'react-native';
import { Card, Text, List, Divider, useTheme, Avatar, ActivityIndicator, Button } from 'react-native-paper';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useSelector, useDispatch } from 'react-redux';
import customaxios from '../Component/customaxios';
const Ai = ({route}) => {
  const user = useSelector((state) => state.user.user);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const theme = useTheme();
  const windowWidth = Dimensions.get('window').width;
const userId = user.user._id
console.log("userId", userId)
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get the token from AsyncStorage
      const token = await SecureStore.getItem('token');
      
     

      const response = await customaxios.get(`/user/ai/${userId}`, );

      if (response.data.success) {
        setData(response.data.data);
      } else {
        throw new Error(response.data.error || 'Failed to fetch data');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#ffffff" />
        <Text style={styles.loadingText}>Analyzing your financial data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <MaterialCommunityIcons name="alert-circle" size={50} color="#ff4444" />
        <Text style={styles.errorText}>{error}</Text>
        <Card.Actions>
          <Button mode="contained" onPress={fetchData}>
            Retry
          </Button>
        </Card.Actions>
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>No data available</Text>
      </View>
    );
  }

  // Prepare data for prediction charts
  const predictionChartData = {
    labels: data.predictions.map(p => p.date.split('-')[2]), // Just show the day
    datasets: [
      {
        data: data.predictions.map(p => p.predictedExpenses),
        color: (opacity = 1) => `rgba(255, 0, 0, ${opacity})`,
        strokeWidth: 2
      },
      {
        data: data.predictions.map(p => p.predictedIncome),
        color: (opacity = 1) => `rgba(0, 255, 0, ${opacity})`,
        strokeWidth: 2
      }
    ],
    legend: ['Expenses', 'Income']
  };

  // Prepare data for category analysis
  const categoryData = {
    labels: data.historicalData.categoryAnalysis
      .filter(cat => cat.type === 'expense')
      .map(cat => cat.category),
    datasets: [{
      data: data.historicalData.categoryAnalysis
        .filter(cat => cat.type === 'expense')
        .map(cat => cat.totalSpent)
    }]
  };

  const chartConfig = {
    backgroundColor: '#1e1e1e',
    backgroundGradientFrom: '#1e1e1e',
    backgroundGradientTo: '#1e1e1e',
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false
  };

  return (
    <ScrollView style={styles.container}>
      {/* Refresh Control */}
      <View style={styles.refreshContainer}>
        <Button 
          mode="contained"
          onPress={fetchData}
          icon="refresh"
          style={styles.refreshButton}
        >
          Refresh Analysis
        </Button>
      </View>

      {/* AI Confidence Score */}
      <Card style={styles.card}>
        <Card.Title
          title="AI Analysis Confidence"
          left={props => <Avatar.Icon {...props} icon="brain" />}
        />
        <Card.Content>
          <Text style={styles.confidenceScore}>
            {(data.aiInsights.confidenceScore * 100).toFixed(0)}% Confidence
          </Text>
        </Card.Content>
      </Card>

      {/* Predictions Chart */}
      <Card style={styles.card}>
        <Card.Title 
          title="7-Day Predictions"
          left={props => <Avatar.Icon {...props} icon="chart-line" />}
        />
        <Card.Content>
          <LineChart
            data={predictionChartData}
            width={windowWidth - 40}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        </Card.Content>
      </Card>

      {/* Category Spending */}
      <Card style={styles.card}>
        <Card.Title 
          title="Category Analysis"
          left={props => <Avatar.Icon {...props} icon="chart-bar" />}
        />
        <Card.Content>
          <BarChart
            data={categoryData}
            width={windowWidth - 40}
            height={220}
            chartConfig={chartConfig}
            style={styles.chart}
            verticalLabelRotation={30}
          />
        </Card.Content>
      </Card>

      {/* AI Insights */}
      <Card style={styles.card}>
        <Card.Title 
          title="AI Insights"
          left={props => <Avatar.Icon {...props} icon="lightbulb" />}
        />
        <Card.Content>
          <List.Section>
            {/* Spending Patterns */}
            <List.Accordion
              title="Spending Patterns"
              left={props => <List.Icon {...props} icon="trending-down" />}
            >
              {data.aiInsights.aiPredictions.spendingPatterns.map((pattern, index) => (
                <List.Item
                  key={index}
                  title={pattern.category}
                  titleStyle={{ color: "white" }} // Change title text color
  descriptionStyle={{ color: "white" }} 
                  description={pattern.description}
                  style = {{color : "white"}}
                  left={props => <MaterialCommunityIcons name="cash" size={24} color="#fff" />}
                />
              ))}
            </List.Accordion>

            {/* Budget Recommendations */}
            <List.Accordion
              title="Budget Recommendations"
              left={props => <List.Icon {...props} icon="wallet" />}
            >
              {data.aiInsights.aiPredictions.budgetRecommendations.map((rec, index) => (
                <List.Item
                  key={index}
                  titleStyle={{ color: "white" }} // Change title text color
  descriptionStyle={{ color: "white" }} 
                  title={rec.category}
                  description={rec.recommendation}
                  left={props => <MaterialCommunityIcons name="bookmark" size={24} color="#fff" />}
                />
              ))}
            </List.Accordion>

            {/* Income Opportunities */}
            <List.Accordion
              title="Income Opportunities"
              left={props => <List.Icon {...props} icon="trending-up" />}
            >
              {data.insights.income.map((income, index) => (
                <List.Item
                  key={index}
                  titleStyle={{ color: "white" }} // Change title text color
  descriptionStyle={{ color: "white" }} 
                  title={income.opportunity}
                  description={`Potential increase: $${income.potentialIncrease}`}
                  left={props => <MaterialCommunityIcons name="cash-plus" size={24} color="#fff" />}
                />
              ))}
            </List.Accordion>
          </List.Section>
        </Card.Content>
      </Card>

      {/* Budget Status */}
      <Card style={styles.card}>
        <Card.Title 
          title="Budget Status"
          left={props => <Avatar.Icon {...props} icon="wallet" />}
        />
        <Card.Content>
          {data.historicalData.budgetStatus.map((budget, index) => (
            <View key={index} style={styles.budgetItem}>
              <Text style={styles.budgetCategory}>{budget.name}</Text>
              <Text style={styles.budgetNumbers}>
                Spent: ${budget.spent} / ${budget.limit}
              </Text>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill,
                    { 
                      width: `${(budget.spent / budget.limit) * 100}%`,
                      backgroundColor: budget.spent > budget.limit * 0.8 ? '#ff4444' : '#00C851'
                    }
                  ]} 
                />
              </View>
            </View>
          ))}
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 10,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    marginBottom: 16,
    backgroundColor: '#1e1e1e',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  confidenceScore: {
    fontSize: 24,
    textAlign: 'center',
    color: '#fff',
  },
  budgetItem: {
    marginVertical: 8,
  },
  budgetCategory: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 4,
  },
  budgetNumbers: {
    fontSize: 14,
    color: '#rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#333',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 16,
  },
  errorText: {
    color: '#ff4444',
    marginTop: 10,
    fontSize: 16,
    textAlign: 'center',
  },
  refreshContainer: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  refreshButton: {
    marginBottom: 10,
  },
});

export default Ai;