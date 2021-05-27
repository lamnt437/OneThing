import React, { useState, useEffect } from 'react';
import {
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Keyboard,
  ScrollView,
  Alert,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import Task from './components/Task';

export default function App() {
  const [task, setTask] = useState();
  const [taskItems, setTaskItems] = useState([]);
  const [doneItems, setDoneItems] = useState([]);

  useEffect(() => {
    console.log('used effect');
    async function getTasks() {
      try {
        const tasksRetrieved = await AsyncStorage.getItem('taskItems');
        if (tasksRetrieved !== null) {
          setTaskItems(JSON.parse(tasksRetrieved));
        }
        // Alert.alert("Storage", "Loaded tasks");
      } catch (error) {
        console.log(error);
        // Alert.alert("Storage", "Error Loading task");
      }
    }

    async function getDoneItems() {
      try {
        const doneItemsRetrieved = await AsyncStorage.getItem('doneItems');
        if (doneItemsRetrieved !== null) {
          setDoneItems(JSON.parse(doneItemsRetrieved));
        }
      } catch (error) {
        console.log(error);
      }
    }
    getTasks();
    getDoneItems();
  }, []);

  const handleAddTask = async () => {
    Keyboard.dismiss();
    setTaskItems([task, ...taskItems]);
    setTask(null);

    try {
      const savedTasks = await AsyncStorage.getItem('taskItems');
      if (savedTasks !== null) {
        const parsedSavedTasks = JSON.parse(savedTasks);
        await AsyncStorage.setItem(
          'taskItems',
          JSON.stringify([task, ...parsedSavedTasks])
        );
      } else {
        await AsyncStorage.setItem('taskItems', JSON.stringify([task]));
      }

      // Alert.alert("Storage", "Saved task");
    } catch (error) {
      console.log(error);
      // Alert.alert("Storage", "Error Saving task");
    }
  };

  // TODO save doneItems
  const completeTask = async (index) => {
    let doneItem = taskItems[index];
    setDoneItems([...doneItems, doneItem]);

    try {
      let savedDoneItems = await AsyncStorage.getItem('doneItems');
      if (savedDoneItems !== null) {
        let parsedDoneItems = JSON.parse(savedDoneItems);
        await AsyncStorage.setItem(
          'doneItems',
          JSON.stringify([doneItem, ...parsedDoneItems])
        );
      } else {
        await AsyncStorage.setItem('doneItems', JSON.stringify([doneItem]));
      }
    } catch (error) {
      console.log(error);
    }

    let itemsCopy = [...taskItems];
    itemsCopy.splice(index, 1);
    setTaskItems(itemsCopy);
    try {
      await AsyncStorage.setItem('taskItems', JSON.stringify(itemsCopy));
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <View style={styles.container}>
      {/* Added this scroll view to enable scrolling when list gets longer than the page */}
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
        }}
        keyboardShouldPersistTaps='handled'
      >
        {/* Today's Tasks */}
        <View style={styles.tasksWrapper}>
          <Text style={styles.sectionTitle}>Today's tasks</Text>
          <View style={styles.items}>
            {/* This is where the tasks will go! */}
            {taskItems.map((item, index) => {
              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => completeTask(index)}
                >
                  <Task text={item} />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Write a task */}
      {/* Uses a keyboard avoiding view which ensures the keyboard does not cover the items on screen */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.writeTaskWrapper}
      >
        {/* Done counter */}
        <View style={styles.doneCounter}>
          <Text>{doneItems.length}</Text>
        </View>

        {/* Input task */}
        <TextInput
          style={styles.input}
          placeholder={'Write a task'}
          value={task}
          onChangeText={(text) => setTask(text)}
        />
        <TouchableOpacity onPress={() => handleAddTask()}>
          <View style={styles.addWrapper}>
            <Text style={styles.addText}>+</Text>
          </View>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8EAED',
  },
  tasksWrapper: {
    paddingTop: 80,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  items: {
    marginTop: 30,
  },
  writeTaskWrapper: {
    position: 'absolute',
    bottom: 60,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  input: {
    paddingVertical: 15,
    paddingHorizontal: 15,
    backgroundColor: '#FFF',
    borderRadius: 60,
    borderColor: '#C0C0C0',
    borderWidth: 1,
    width: 250,
  },
  addWrapper: {
    width: 60,
    height: 60,
    backgroundColor: '#FFF',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#C0C0C0',
    borderWidth: 1,
  },
  addText: {},
  doneCounter: {
    borderRadius: 60,
    width: 60,
    height: 60,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#C0C0C0',
    borderWidth: 1,
  },
});
