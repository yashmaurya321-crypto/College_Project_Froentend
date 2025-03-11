import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Dimensions, RefreshControl } from 'react-native';
import { 
  Text, 
  Card, 
  Title, 
  Paragraph, 
  Divider, 
  ActivityIndicator, 
  Chip, 
  List, 
  Button,
  useTheme,
  Banner,
  Provider as PaperProvider,
  DarkTheme as PaperDarkTheme
} from 'react-native-paper';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { useFocusEffect } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import customaxios from '../Component/customaxios';
import { useSelector } from 'react-redux';
import { DarkTheme as NavigationDarkTheme } from '@react-navigation/native';
import { merge } from 'lodash';

const { width } = Dimensions.get('window');

// Create a custom dark theme by merging React Navigation's DarkTheme with React Native Paper's DarkTheme
const CustomDarkTheme = merge({}, NavigationDarkTheme, PaperDarkTheme, {
  colors: {
    primary: '#6200ee',
    accent: '#03dac6',
    background: '#121212',
    surface: '#1e1e1e',
    card: '#1e1e1e',
    text: '#ffffff',
    border: '#272727',
    notification: '#ff80ab',
    error: '#CF6679',
    warning: '#F2C94C',
    success: '#03DAC6',
    onSurface: '#ffffff',
  },
  dark: true,
});

const Ai = () => {
  const user = useSelector((state) => state.user.user);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [financialData, setFinancialData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const theme = CustomDarkTheme; // Use custom dark theme
  const userId = user?.user?._id;
  
  const fetchFinancialAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = await SecureStore.getItem('token');
      
      const response = await customaxios.get(`/user/ai/${userId}`);
      
      if (response.data.success) {
        setFinancialData(response.data.data);
      } else {
        setError('Failed to load financial analysis');
      }
    } catch (err) {
      console.error('Error fetching AI analysis:', err);
      setError('Error connecting to server. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when component mounts
  useEffect(() => {
    fetchFinancialAnalysis();
  }, [userId]);

  // Fetch data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchFinancialAnalysis();
    }, [userId])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchFinancialAnalysis();
    setRefreshing(false);
  }, [userId]);
  const generatePredictionsData = () => {
    // Generate 30 days of forecast data
    const today = new Date();
    const labels = [];
    const expensesData = [];
    const incomeData = [];
    
    // Start with base values and add trends
    let baseExpense = financialData.predictions[0]?.predictedExpenses || 2000;
    let baseIncome = financialData.predictions[0]?.predictedIncome || 3000;
    let expenseTrend = 1.005; // Slight upward trend for expenses
    let incomeTrend = 1.003; // Slight upward trend for income
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      labels.push(`${date.getMonth() + 1}/${date.getDate()}`);
      
      // Add weekly patterns (expenses higher on weekends, income steady)
      const dayOfWeek = date.getDay();
      const weekendFactor = (dayOfWeek === 0 || dayOfWeek === 6) ? 1.1 : 1;
      
      // Add some randomness for realistic predictions
      const expenseRandom = 0.95 + (Math.random() * 0.1); // Between 0.95 and 1.05
      const incomeRandom = 0.98 + (Math.random() * 0.04); // Between 0.98 and 1.02
      
      // Calculate values
      baseExpense = baseExpense * expenseTrend * expenseRandom * weekendFactor;
      baseIncome = baseIncome * incomeTrend * incomeRandom;
      
      expensesData.push(Math.round(baseExpense));
      incomeData.push(Math.round(baseIncome));
    }
    
    return {
      labels: labels,
      datasets: [
        {
          data: expensesData,
          color: () => 'rgba(255, 0, 0, 0.6)',
          strokeWidth: 2
        },
        {
          data: incomeData,
          color: () => 'rgba(0, 255, 0, 0.6)',
          strokeWidth: 2
        }
      ],
      legend: ["Expenses", "Income"]
    };
  };
  
  // Use the enhanced predictions data
  const enhancedPredictionsData = generatePredictionsData();
  
  // Enhanced chart configuration
  const enhancedChartConfig = {
    ...chartConfig,
    propsForLabels: {
      fontSize: 10,
      rotation: -45
    },
    formatYLabel: value => `$${value}`,
    horizontalLabelRotation: -45,
    verticalLabelRotation: 0,
    propsForDots: {
      r: "4",
      strokeWidth: "2",
      stroke: theme.colors.background
    }
  };
  
  if (loading && !refreshing) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>Loading financial insights...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.errorText, { color: theme.colors.error }]}>{error}</Text>
        <Button mode="contained" onPress={fetchFinancialAnalysis} style={styles.retryButton} color={theme.colors.primary}>
          Retry
        </Button>
      </View>
    );
  }

  // If data is not yet loaded
  if (!financialData) return null;

  // Extract AI insights
  const { aiInsights } = financialData;
  const { aiPredictions, confidenceScore } = aiInsights;
  
  // Prepare data for prediction chart
  const predictionsData = {
    labels: financialData.predictions.slice(0, 7).map(pred => {
      const date = new Date(pred.date);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    }),
    datasets: [
      {
        data: financialData.predictions.slice(0, 7).map(pred => pred.predictedExpenses),
        color: () => 'rgba(255, 0, 0, 0.6)',
        strokeWidth: 2
      },
      {
        data: financialData.predictions.slice(0, 7).map(pred => pred.predictedIncome),
        color: () => 'rgba(0, 255, 0, 0.6)',
        strokeWidth: 2
      }
    ],
    legend: ["Expenses", "Income"]
  };

  // Prepare category spending data
  const categoryData = {
    labels: financialData.historicalData.categoryAnalysis
      .filter(cat => cat.type === 'expense')
      .slice(0, 5)
      .map(cat => cat.category),
    datasets: [
      {
        data: financialData.historicalData.categoryAnalysis
          .filter(cat => cat.type === 'expense')
          .slice(0, 5)
          .map(cat => cat.totalSpent)
      }
    ]
  };

  const getSeverityColor = (severity) => {
    switch (severity.toLowerCase()) {
      case 'high': return theme.colors.error;
      case 'medium': return theme.colors.warning;
      default: return theme.colors.success;
    }
  };

  // Chart configuration for dark theme
  const chartConfig = {
    backgroundColor: theme.colors.surface,
    backgroundGradientFrom: theme.colors.surface,
    backgroundGradientTo: theme.colors.surface,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    style: {
      borderRadius: 16
    },
    propsForDots: {
      r: "7",
      strokeWidth: "2",
      stroke: theme.colors.background
    }
  };

  // Custom Chip component to avoid the variant error
  const SeverityChip = ({ severity }) => (
    <View style={[styles.customChip, { backgroundColor: getSeverityColor(severity) }]}>
      <Text style={styles.chipText}>{severity.toUpperCase()}</Text>
    </View>
  );

  return (
    <PaperProvider theme={CustomDarkTheme}>
      <ScrollView 
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            progressBackgroundColor={theme.colors.surface}
          />
        }
      >
        <Banner
          visible={true}
          icon="brain"
          actions={[]}
          style={{ backgroundColor: theme.colors.surface }}
          theme={theme}
        >
          <Text style={{ color: theme.colors.text }}>
            AI Confidence Score: {Math.round(confidenceScore * 100)}%
          </Text>
        </Banner>

        {/* Predictions Chart */}
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Title style={{ color: theme.colors.text }}>30-Day Financial Forecast</Title>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <LineChart
                data={predictionsData}
                width={width - 40}
                height={220}
                chartConfig={chartConfig}
                bezier
                style={styles.chart}
              />
            </ScrollView>
          </Card.Content>
        </Card>

        {/* Category Spending */}
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Title style={{ color: theme.colors.text }}>Top Spending Categories</Title>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <BarChart
                data={categoryData}
                width={width - 40}
                height={220}
                chartConfig={{
                  ...chartConfig,
                  color: (opacity = 1) => `rgba(98, 0, 238, ${opacity})`,
                }}
                style={styles.chart}
                verticalLabelRotation={30}
              />
            </ScrollView>
          </Card.Content>
        </Card>

        {/* AI Insights */}
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Title style={{ color: theme.colors.text }}>Spending Patterns</Title>
            <List.Section>
              {aiPredictions.spendingPatterns.map((item, index) => (
                <List.Item
                  key={`pattern-${index}`}
                  title={item.pattern}
                  titleNumberOfLines={5}
                  titleStyle={{ color: theme.colors.text }}
                  left={props => <List.Icon {...props} icon="trending-up" color={theme.colors.primary} />}
                />
              ))}
            </List.Section>
          </Card.Content>
        </Card>

        {/* Budget Recommendations */}
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Title style={{ color: theme.colors.text }}>Budget Recommendations</Title>
            <List.Section>
              {aiPredictions.budgetRecommendations.map((item, index) => (
                <List.Item
                  key={`budget-${index}`}
                  title={item.recommendation}
                  titleStyle={{ color: theme.colors.text }}
                  titleNumberOfLines={5}
                  left={props => <List.Icon {...props} icon="wallet" color={theme.colors.primary} />}
                />
              ))}
            </List.Section>
          </Card.Content>
        </Card>

        {/* Savings Opportunities */}
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Title style={{ color: theme.colors.text }}>Savings Opportunities</Title>
            <List.Section>
              {aiPredictions.savingsOpportunities.map((item, index) => (
                <List.Item
                  key={`savings-${index}`}
                  title={item.opportunity}
                  titleStyle={{ color: theme.colors.text }}
                  titleNumberOfLines={5}
                  description={`Potential savings: $${item.potentialSavings}`}
                  descriptionStyle={{ color: theme.colors.text, opacity: 0.7 }}
                  left={props => <List.Icon {...props} icon="piggy-bank" color={theme.colors.primary} />}
                />
              ))}
            </List.Section>
          </Card.Content>
        </Card>

        {/* Income Growth */}
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Title style={{ color: theme.colors.text }}>Income Growth Strategies</Title>
            <List.Section>
              {aiPredictions.incomeGrowth.map((item, index) => (
                <List.Item
                  key={`income-${index}`}
                  title={item.strategy}
                  titleStyle={{ color: theme.colors.text }}
                  titleNumberOfLines={5}
                  description={`Potential increase: $${item.potentialIncrease}`}
                  descriptionStyle={{ color: theme.colors.text, opacity: 0.7 }}
                  left={props => <List.Icon {...props} icon="cash-plus" color={theme.colors.success} />}
                />
              ))}
            </List.Section>
          </Card.Content>
        </Card>

        {/* Risk Assessment */}
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Title style={{ color: theme.colors.text }}>Financial Risk Assessment</Title>
            {aiPredictions.riskAssessment.map((item, index) => (
              <View key={`risk-${index}`} style={styles.riskItem}>
                <View style={styles.riskHeader}>
                  <Text style={[styles.riskTitle, { color: theme.colors.text }]}>{item.risk}</Text>
                  <SeverityChip severity={item.severity} />
                </View>
                <Paragraph style={[styles.mitigation, { color: theme.colors.text, opacity: 0.8 }]} numberOfLines={5}>
                  {item.mitigation}
                </Paragraph>
                <Divider style={[styles.divider, { backgroundColor: theme.colors.border }]} />
              </View>
            ))}
          </Card.Content>
        </Card>

        {/* Overspending Alerts */}
        {financialData.insights.overspending.length > 0 && (
          <Card style={[styles.card, { backgroundColor: '#331111' }]}>
            <Card.Content>
              <Title style={{ color: theme.colors.text }}>Overspending Alerts</Title>
              <List.Section>
                {financialData.insights.overspending.map((item, index) => (
                  <List.Item
                    key={`overspend-${index}`}
                    title={item.category}
                    titleStyle={{ color: theme.colors.text }}
                    description={item.recommendation}
                    descriptionStyle={{ color: theme.colors.text, opacity: 0.8 }}
                    descriptionNumberOfLines={4}
                    left={props => <List.Icon {...props} icon="alert-circle" color={theme.colors.error} />}
                  />
                ))}
              </List.Section>
            </Card.Content>
          </Card>
        )}
      </ScrollView>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 10,
  },
  card: {
    margin: 10,
    elevation: 4,
    borderRadius: 10,
  },
  alertCard: {
    backgroundColor: '#331111',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
    paddingRight: 20,
    minWidth: width - 40,
  },
  riskItem: {
    marginVertical: 8,
  },
  riskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  riskTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  customChip: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: {
    fontSize: 10,
    color: 'white',
    fontWeight: 'bold',
  },
  mitigation: {
    marginTop: 4,
    marginBottom: 8,
  },
  divider: {
    marginVertical: 8,
  },
});

export default Ai;