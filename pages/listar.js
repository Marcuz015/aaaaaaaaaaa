import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Alert, TextInput } from 'react-native';
import Parse from 'parse/react-native.js'; // Importa o Parse

Parse.initialize('WEsExxhgVdwfPLRGp8wOR2EmnPm1ttDGHpOyQDX2', 'Z6K2jZvYfDJh42y3vxevpPK8BIBJCbTPXn9uuHsM');
Parse.serverURL = 'https://parseapi.back4app.com/';

const Listar = ({ routes, setRoutes }) => {
  const [editingIndex, setEditingIndex] = useState(null);
  const [editedTitle, setEditedTitle] = useState('');

  const handleDelete = (index) => {
    Alert.alert(
      'Excluir Rota',
      'Tem certeza de que deseja excluir esta rota?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Excluir',
          onPress: () => deleteRoute(index),
        },
      ],
      { cancelable: false }
    );
  };

  const deleteRoute = async (index) => {
    try {
      const query = new Parse.Query('RoutesContainer'); // Use um nome de classe apropriado
      const result = await query.first();
      
      if (result) {
        const routesArray = result.get('routes') || [];
        routesArray.splice(index, 1);
        result.set('routes', routesArray);
        
        // Salva o objeto atualizado
        await result.save();
        
        // Atualiza o estado local após exclusão
        setRoutes(routesArray);
        Alert.alert('Sucesso', 'Rota excluída com sucesso!');
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível excluir a rota.');
      console.error('Erro ao excluir rota:', error);
    }
  };

  const handleEdit = (index) => {
    setEditingIndex(index);
    setEditedTitle(routes[index].title);
  };

  const handleSave = async () => {
    try {
      const index = editingIndex;
      if (index !== null) {
        const query = new Parse.Query('RoutesContainer'); // Use um nome de classe apropriado
        const result = await query.first();
        
        if (result) {
          const routesArray = result.get('routes') || [];
          routesArray[index].title = editedTitle;
          result.set('routes', routesArray);
          
          // Salva o objeto atualizado
          await result.save();
          
          // Atualiza o estado local após edição
          setRoutes(routesArray);
          setEditingIndex(null);
          setEditedTitle('');
          Alert.alert('Sucesso', 'Título atualizado com sucesso!');
        }
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível atualizar o título.');
      console.error('Erro ao atualizar título:', error);
    }
  };

  const renderItem = ({ item, index }) => (
    <View style={styles.itemContainer}>
      {editingIndex === index ? (
        <View style={styles.editContainer}>
          <TextInput
            style={styles.editInput}
            value={editedTitle}
            onChangeText={setEditedTitle}
          />
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Salvar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.textContainer}>
          <Text style={styles.itemTitle}>{item.title}</Text>
          <Text style={styles.itemText}>
            Latitude: {item.latitude}, Longitude: {item.longitude}
          </Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => handleEdit(index)}
            >
              <Text style={styles.editButtonText}>Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDelete(index)}
            >
              <Text style={styles.deleteButtonText}>Excluir</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={routes}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.emptyText}>Nenhuma rota encontrada.</Text>}
      />
      <StatusBar style="auto" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingTop: 10,
  },
  itemContainer: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    marginTop: 20
  },
  textContainer: {
    flex: 1,
  },
  editContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editInput: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#673ab7',
    marginRight: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#4caf50',
    borderRadius: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  itemText: {
    fontSize: 14,
    color: '#666',
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  editButton: {
    backgroundColor: '#ffa726',
    borderRadius: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  editButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: '#e57373',
    borderRadius: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 18,
    color: '#999',
    marginTop: 20,
  },
});

export default Listar;
