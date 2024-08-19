import 'react-native-get-random-values'; // Certifique-se de que este pacote está instalado
import React, { useState, useEffect } from 'react';
import { Alert, TouchableOpacity, View, Text, SafeAreaView, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Parse from 'parse/react-native.js';
import * as Location from 'expo-location';

import Home from '../pages/home';
import Listar from '../pages/listar';

const Tab = createBottomTabNavigator();
Parse.setAsyncStorage(AsyncStorage);
Parse.initialize('WEsExxhgVdwfPLRGp8wOR2EmnPm1ttDGHpOyQDX2', 'Z6K2jZvYfDJh42y3vxevpPK8BIBJCbTPXn9uuHsM');
Parse.serverURL = 'https://parseapi.back4app.com/';

const saveRoute = async (latitude, longitude, title, setRoutes) => {
  try {
    // Busca ou cria o objeto que contém a array de rotas
    const query = new Parse.Query('RoutesContainer'); // Use um nome de classe apropriado
    const result = await query.first();
    
    let routesObject;
    if (!result) {
      // Se não houver objeto, cria um novo
      routesObject = new Parse.Object('RoutesContainer'); // Use um nome de classe apropriado
      routesObject.set('routes', []);
    } else {
      // Se já houver um objeto, usa o existente
      routesObject = result;
    }
    
    // Adiciona a nova rota à array
    const routesArray = routesObject.get('routes') || [];
    routesArray.push({ latitude, longitude, title });
    routesObject.set('routes', routesArray);
    
    // Salva o objeto atualizado
    await routesObject.save();

    // Atualiza o estado local com a nova lista de rotas
    setRoutes(routesArray);

    Alert.alert('Sucesso', 'Localização salva com sucesso!');
  } catch (error) {
    Alert.alert('Erro', 'Não foi possível salvar a localização.');
    console.error('Erro ao salvar localização:', error);
  }
};

const loadRoutes = async (setRoutes) => {
  try {
    const query = new Parse.Query('RoutesContainer'); // Use um nome de classe apropriado
    const result = await query.first();
    const routesArray = result ? result.get('routes') || [] : [];
    
    // Atualiza o estado local com as rotas carregadas
    setRoutes(routesArray);
  } catch (error) {
    Alert.alert('Erro', 'Não foi possível carregar as rotas.');
    console.error('Erro ao carregar rotas:', error);
  }
};

const deleteRoute = async (index, setRoutes) => {
  try {
    const query = new Parse.Query('RoutesContainer'); // Use um nome de classe apropriado
    const result = await query.first();
    
    if (result) {
      const routesArray = result.get('routes') || [];
      
      // Remove a rota da array
      routesArray.splice(index, 1);
      result.set('routes', routesArray);
      
      // Salva o objeto atualizado
      await result.save();

      Alert.alert('Sucesso', 'Rota excluída com sucesso!');
      // Atualiza a lista de rotas após exclusão
      setRoutes(routesArray);
    }
  } catch (error) {
    Alert.alert('Erro', 'Não foi possível excluir a rota.');
    console.error('Erro ao excluir rota:', error);
  }
};

const showAlert = async (setRoutes, isRecording, setIsRecording) => {
  let { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Permissão de localização necessária!');
    return;
  }

  const { coords } = await Location.getCurrentPositionAsync({});
  const { latitude, longitude } = coords;

  if (!isRecording) {
    // Inicia a gravação
    setIsRecording(true);
    Alert.alert('Gravação Iniciada', 'Você está agora gravando a sua rota.');
  } else {
    // Finaliza a gravação
    setIsRecording(false);
    Alert.alert(
      "Gravar Rota",
      "Você deseja salvar sua rota atual?",
      [
        {
          text: "Não",
          style: "cancel"
        },
        {
          text: "Sim",
          onPress: async () => {
            await saveRoute(latitude, longitude, "Título da Rota", setRoutes);
          }
        }
      ],
      { cancelable: false }
    );
  }
};

const CustomTabBar = ({ state, descriptors, navigation, setRoutes, isRecording, setIsRecording }) => {
  const { routes, index } = state;

  return (
    <View style={styles.tabBar}>
      {routes.map((route, i) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = index === i;
        const isCenterButton = route.name === 'Gravar';

        return isCenterButton ? (
          <TouchableOpacity
            key={route.key}
            style={styles.centerButton}
            onPress={() => showAlert(setRoutes, isRecording, setIsRecording)}
          >
            <Ionicons name={isRecording ? "stop" : "recording"} size={24} color="#fff" />
            <Text style={styles.centerButtonText}>{isRecording ? "Parar" : "Gravar"}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            key={route.key}
            onPress={() => navigation.navigate(route.name)}
            style={[styles.tabButton, isFocused && styles.focusedButton]}
          >
            <Ionicons
              name={i === 0 ? 'home' : 'list'}
              size={24}
              color={isFocused ? '#673ab7' : '#222'}
            />
            <Text style={{ color: isFocused ? '#673ab7' : '#222' }}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default function Routes() {
  const [routes, setRoutes] = useState([]);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    loadRoutes(setRoutes);
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Tab.Navigator
        tabBar={(props) => (
          <CustomTabBar {...props} setRoutes={setRoutes} isRecording={isRecording} setIsRecording={setIsRecording} />
        )}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tab.Screen
          name="Home"
          component={Home}
          options={{
            tabBarLabel: 'Home',
          }}
        />
        <Tab.Screen
          name="Gravar"
          component={() => null}
          options={{
            tabBarLabel: 'Gravar',
            tabBarButton: () => null,
          }}
        />
        <Tab.Screen
          name="Listar"
          component={() => <Listar routes={routes} setRoutes={setRoutes} />} // Passa setRoutes como prop
          options={{
            tabBarLabel: 'Listar',
            tabBarStyle: { display: 'none' },
          }}
        />
      </Tab.Navigator>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    height: 60,
    backgroundColor: '#fff',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerButton: {
    backgroundColor: '#673ab7',
    borderRadius: 30,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    width: 70,
    bottom: 15,
  },
  centerButtonText: {
    color: '#fff',
    marginTop: 5,
  },
  focusedButton: {
    borderBottomColor: '#673ab7',
    borderBottomWidth: 2,
  },
});
