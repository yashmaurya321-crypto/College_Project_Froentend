import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  Modal, 
  TextInput, 
  ScrollView 
} from 'react-native';
import { useSelector } from 'react-redux';
import { MaterialIcons } from '@expo/vector-icons';

const Budget = ({ navigation }) => {
  const data = useSelector((state) => state.user.user);
  
  const [modalVisible, setModalVisible] = useState(false);
  const [budgets, setBudgets] = useState(data?.budjet?.[0]?.categories || []);
  const [newBudget, setNewBudget] = useState({
    category: '',
    total: '',
  });

  const addBudget = () => {
    if (newBudget.category && newBudget.total) {
      const newBudgetItem = {
        _id: Math.random().toString(36).substr(2, 9), 
        name: newBudget.category,
        limit: parseFloat(newBudget.total),
        spent: 0, 
      };

      setBudgets([...budgets, newBudgetItem]);
      setModalVisible(false);
      setNewBudget({ category: '', total: '' });
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.budgetGrid}>
        {budgets.map((budget, index) => (
          <TouchableOpacity key={budget._id || index} style={styles.budgetCard}>
            <View style={styles.cardIcon}>
              <MaterialIcons 
                name={budget.category.icon} 
                size={24} 
                color={budget.category.color} 
              />
            </View>
            <Text style={styles.budgetCategory}>{budget.name}</Text>
            <Text style={styles.budgetAmount}>
              ${budget.limit - budget.spent} remaining
            </Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progress, 
                  { width: `${(budget.spent / budget.limit) * 100}%`, backgroundColor: '#FF6B6B' }
                ]} 
              />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => navigation.navigate('AddBudjet', { budjetId: data?.budjet?.[0]?._id })}
      >
        <Text style={styles.addButtonText}>+ Add Budget</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Budget</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Budget Category"
              placeholderTextColor="#8E8E93"
              value={newBudget.category}
              onChangeText={(text) => setNewBudget({ ...newBudget, category: text })}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Total Budget Amount"
              placeholderTextColor="#8E8E93"
              keyboardType="numeric"
              value={newBudget.total}
              onChangeText={(text) => setNewBudget({ ...newBudget, total: text })}
            />
            
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity 
                style={styles.modalCancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.modalConfirmButton}
                onPress={addBudget}
              >
                <Text style={styles.modalConfirmText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingTop: 50,
  },
  budgetGrid: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  budgetCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
  },
  cardIcon: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    width: 50,
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  budgetCategory: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
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
  addButton: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: '#9747f5',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 18,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#1E1E1E',
    borderRadius: 20,
    padding: 20,
  },
  modalTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    color: 'white',
    borderRadius: 15,
    padding: 15,
    fontSize: 16,
    marginBottom: 15,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalCancelButton: {
    flex: 1,
    marginRight: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
  },
  modalCancelText: {
    color: '#8E8E93',
    fontWeight: '600',
  },
  modalConfirmButton: {
    flex: 1,
    backgroundColor: '#4A90E2',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
  },
  modalConfirmText: {
    color: 'white',
    fontWeight: '700',
  },
});

export default Budget;
